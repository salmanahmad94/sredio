import { CATALOG, type CopilotDraft } from '@sredio/shared';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import config from '../../config';
import logger from '../../config/winston';
import HttpError from '../../errors/HttpError';

// What the model returns. Kept flat (no free-form maps) so it works as a strict output schema;
// it's mapped onto a ZapInput afterwards.
const draftSchema = z.object({
    supported: z
        .boolean()
        .describe('False when the request needs a trigger or action that is not available.'),
    explanation: z
        .string()
        .describe(
            'One or two sentences for the user: what the Zap does, or why it cannot be built.'
        ),
    name: z.string().describe('A short name for the Zap.'),
    trigger: z.object({
        app: z.string(),
        key: z.string(),
        repository: z
            .string()
            .describe('owner/name of the repository to watch, or an empty string if not given.')
    }),
    action: z.object({
        app: z.string(),
        key: z.string(),
        body: z
            .string()
            .describe('The comment text, using {{path}} placeholders for trigger fields.')
    })
});

const availableCatalog = () =>
    CATALOG.filter((app) => app.status === 'available').map((app) => ({
        app: app.key,
        triggers: app.triggers.map((trigger) => ({
            key: trigger.key,
            name: trigger.name,
            description: trigger.description,
            placeholders: trigger.outputs.map((output) => `{{${output.path}}} (${output.label})`)
        })),
        actions: app.actions.map((action) => ({
            key: action.key,
            name: action.name,
            description: action.description
        }))
    }));

const comingSoon = () =>
    CATALOG.filter((app) => app.status !== 'available')
        .map((app) => app.name)
        .join(', ');

const SYSTEM_PROMPT = `You turn a short description into a draft automation ("Zap") for sredio, a small workflow automation app. A Zap is one trigger plus one action. The user reviews every draft before turning it on.

Only these triggers and actions exist:
${JSON.stringify(availableCatalog(), null, 2)}

These apps are listed in the product but can't run yet: ${comingSoon()}.

Rules:
- Use only the app and key values above.
- If the request needs anything else, set "supported" to false and say in "explanation" which part isn't available yet. That explanation is shown on its own, so don't mention the other fields. Still fill them with the closest available option.
- Pick the repository only from the user's repositories listed in the request, and only when they name one. Otherwise leave it empty.
- A repository that isn't in the user's list is not a reason to set "supported" to false: leave it empty and say in "explanation" that they need admin access to it.
- Write the comment the user asked for. Use the placeholders above where they make it more personal, e.g. thanking the author by login.`;

const client = config.copilot.apiKey ? new OpenAI({ apiKey: config.copilot.apiKey }) : null;

/** Whether OPENAI_API_KEY is set. Without it the Copilot answers 503 and the rest of the app works. */
export const copilotEnabled = (): boolean => client !== null;

/**
 * Turns a description into a draft Zap with OpenAI structured outputs. Nothing is saved: the
 * draft opens in the editor, turned off, for the user to review.
 */
export const draftZap = async (prompt: string, repositories: string[]): Promise<CopilotDraft> => {
    if (!client) throw new HttpError(503, "The Copilot isn't configured. Set OPENAI_API_KEY.");

    const repositoryList = repositories.length
        ? repositories.map((name) => `- ${name}`).join('\n')
        : '(none)';

    const response = await client.responses.parse({
        model: config.copilot.model,
        instructions: SYSTEM_PROMPT,
        input: `My repositories:\n${repositoryList}\n\nWhat I want:\n${prompt}`,
        text: { format: zodTextFormat(draftSchema, 'zap_draft') }
    });

    const refused = response.output.some(
        (item) =>
            item.type === 'message' && item.content.some((content) => content.type === 'refusal')
    );

    if (refused) throw new HttpError(422, "The Copilot couldn't help with that request.");

    const draft = response.output_parsed;

    if (!draft) {
        logger.warn(`Copilot returned no parseable draft (status: ${response.status})`, {
            label: 'COPILOT'
        });
        throw new HttpError(502, "The Copilot's answer couldn't be read. Please try again.");
    }

    if (!draft.supported) throw new HttpError(422, draft.explanation);

    // Only a repository the user can actually add a webhook to.
    const repository = repositories.includes(draft.trigger.repository)
        ? draft.trigger.repository
        : '';

    return {
        explanation: draft.explanation,
        zap: {
            name: draft.name,
            // Drafts are never turned on automatically.
            enabled: false,
            trigger: {
                app: draft.trigger.app,
                key: draft.trigger.key,
                config: repository ? { repository } : {}
            },
            action: {
                app: draft.action.app,
                key: draft.action.key,
                config: { body: draft.action.body }
            }
        }
    };
};
