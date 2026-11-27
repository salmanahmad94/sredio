import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';

import HttpError from '../../errors/HttpError';
import { container } from '../../loaders/container';

/** Loads the Zap a webhook was registered for, with its webhook secret. */
const loadZap: RequestHandler<{ zapId: string }> = async (req, res, next) => {
    const zap = isValidObjectId(req.params.zapId)
        ? await container.zapService.findByIdWithHookSecret(req.params.zapId)
        : null;

    // A delivery for a deleted Zap, or for a webhook that's been replaced.

    if (!zap?.hook) return next(new HttpError(404, 'No webhook is registered here.'));

    res.locals.zap = zap;
    next();
};

export default loadZap;
