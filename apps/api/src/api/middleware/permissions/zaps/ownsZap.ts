import type { RequestHandler } from 'express';

import HttpError from '../../../../errors/HttpError';

/** Zaps belong to the person who made them. Someone else's Zap looks like it doesn't exist. */
const ownsZap: RequestHandler = (req, res, next) => {
    if (!res.locals.zap?.owner.equals(req.user!._id)) {
        return next(new HttpError(404, 'Zap not found.'));
    }

    next();
};

export default ownsZap;
