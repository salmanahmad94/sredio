import type { RequestHandler } from 'express';

import HttpError from '../../errors/HttpError';

/** Parses the verified raw body into res.locals.event. */
const parseEvent: RequestHandler = (req, res, next) => {
    const name = req.header('x-github-event');
    const deliveryId = req.header('x-github-delivery');

    if (!name || !deliveryId) return next(new HttpError(400, 'Missing GitHub event headers.'));

    try {
        res.locals.event = {
            name,
            deliveryId,
            payload: JSON.parse((req.body as Buffer).toString('utf8')) as unknown
        };
    } catch {
        return next(new HttpError(400, 'The body is not valid JSON.'));
    }

    next();
};

export default parseEvent;
