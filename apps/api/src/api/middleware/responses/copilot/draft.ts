import type { RequestHandler } from 'express';

import HttpError from '../../../../errors/HttpError';
import { listAdminRepositories } from '../../../../integrations/github/repositories';
import { copilotEnabled, draftZap } from '../../../../integrations/openai/copilot';
import { container } from '../../../../loaders/container';

/** Turns a description into a draft Zap. Nothing is saved; the builder opens the draft. */
const draft: RequestHandler = async (req, res) => {
    const { prompt } = req.body as { prompt: string };

    // Checked first, so an unconfigured Copilot doesn't call GitHub for nothing.
    if (!copilotEnabled()) {
        throw new HttpError(503, "The Copilot isn't configured. Set OPENAI_API_KEY.");
    }

    const token = await container.userService.getAccessToken(req.user!.id);
    const repositories = await listAdminRepositories(token);

    const result = await draftZap(
        prompt,
        repositories.map((repository) => repository.fullName)
    );

    res.status(200).json(result);
};

export default draft;
