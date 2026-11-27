import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';

import HttpError from '../../../../errors/HttpError';
import { container } from '../../../../loaders/container';

/** Loads the Zap named by :id into res.locals.zap. */
const loadZap: RequestHandler<{ id: string }> = async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) return next(new HttpError(404, 'Zap not found.'));

    const zap = await container.zapService.findById(req.params.id);

    if (!zap) return next(new HttpError(404, 'Zap not found.'));

    res.locals.zap = zap;
    next();
};

export default loadZap;
