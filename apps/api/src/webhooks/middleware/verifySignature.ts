import type { RequestHandler } from 'express';

import HttpError from '../../errors/HttpError';
import { container } from '../../loaders/container';
import { verifySignature as isValidSignature } from '../../utils/github/verifySignature';

/** Rejects deliveries whose signature doesn't match the Zap's webhook secret. */
const verifySignature: RequestHandler = (req, res, next) => {
    const body = req.body as unknown;

    if (!Buffer.isBuffer(body)) return next(new HttpError(415, 'Expected a JSON body.'));

    const secret = container.zapService.hookSecret(res.locals.zap!);
    const header = req.header('x-hub-signature-256');

    if (!isValidSignature(secret, body, header)) {
        container.logger.warn(
            `Rejected a webhook with a bad signature for Zap ${res.locals.zap!.id}.`,
            {
                label: 'WEBHOOKS'
            }
        );
        return next(new HttpError(401, 'Invalid signature.'));
    }

    next();
};

export default verifySignature;
