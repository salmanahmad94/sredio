import { findAction, findApp, findTrigger, type InputField } from './catalog';

export const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/** A trigger or an action: which app, which of its triggers/actions, and its field values. */
export interface ZapStep {
    app: string;
    key: string;
    config: Record<string, string>;
}

/** What the builder sends to create or update a Zap. Validated by `zapInputSchema`. */
export interface ZapInput {
    name: string;
    enabled: boolean;
    trigger: ZapStep;
    action: ZapStep;
}

export type ZapRunStatus = 'queued' | 'retrying' | 'succeeded' | 'failed';

/** One time a Zap ran, shown in the editor's run history. */
export interface ZapRun {
    id: string;
    status: ZapRunStatus;
    summary: string;
    sourceUrl: string | null;
    outputUrl: string | null;
    error: string | null;
    attempts: number;
    createdAt: string;
    finishedAt: string | null;
}

/** A repository the signed-in user can add webhooks to. */
export interface Repository {
    fullName: string;
    private: boolean;
}

export interface Zap {
    id: string;
    name: string;
    enabled: boolean;
    trigger: ZapStep;
    action: ZapStep;
    lastRunAt: string | null;
    runCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ZapIssue {
    path: string;
    message: string;
}

const missingFields = (fields: InputField[], config: Record<string, string>, path: string) =>
    fields
        .filter((field) => field.required && !config[field.key]?.trim())
        .map((field) => ({ path: `${path}.${field.key}`, message: `${field.label} is required.` }));

/**
 * Checks a Zap against the catalog. Drafts may be incomplete, so field requirements only apply
 * when the Zap is being turned on.
 */
export const validateZap = (zap: ZapInput): ZapIssue[] => {
    const issues: ZapIssue[] = [];

    for (const [path, step, find] of [
        ['trigger', zap.trigger, findTrigger],
        ['action', zap.action, findAction]
    ] as const) {
        const app = findApp(step.app);
        const definition = find(step.app, step.key);

        if (!app || !definition) {
            issues.push({ path, message: `Unknown ${path} "${step.app}.${step.key}".` });
            continue;
        }

        if (app.status !== 'available') {
            issues.push({ path, message: `${app.name} isn't available yet.` });
            continue;
        }

        const unknownKeys = Object.keys(step.config).filter(
            (key) => !definition.fields.some((field) => field.key === key)
        );

        for (const key of unknownKeys) {
            issues.push({ path: `${path}.config.${key}`, message: `Unknown field "${key}".` });
        }

        if (zap.enabled) {
            issues.push(...missingFields(definition.fields, step.config, `${path}.config`));
        }
    }

    const repository = zap.trigger.config['repository'];

    if (repository && !REPOSITORY_PATTERN.test(repository)) {
        issues.push({ path: 'trigger.config.repository', message: 'Use the owner/name format.' });
    }

    return issues;
};
