import type { RequestHandler } from 'express';

import HttpError from '../../../../errors/HttpError';
import { container } from '../../../../loaders/container';

import { sendSession } from './session';

const exchange: RequestHandler = async (req, res, next) => {
    const userId = await container.loginCodeService.consume((req.body as { code: string }).code);

    if (!userId) {
        return next(new HttpError(401, 'This sign-in link has expired. Please sign in again.'));
    }

    const user = await container.userService.findById(userId);

    if (!user) return next(new HttpError(401, 'Unauthorized.'));

    sendSession(res, user, 201);
};

export default exchange;
