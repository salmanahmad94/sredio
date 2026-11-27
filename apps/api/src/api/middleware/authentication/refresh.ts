import type { RequestHandler } from 'express';
import passport from 'passport';

import HttpError from '../../../errors/HttpError';
import type { UserDocument } from '../../../models/user';

/** Requires a valid refresh token, sent the same split way as the access token. */
const refresh: RequestHandler = (req, res, next) => {
    passport.authenticate(
        'refresh',
        { session: false },
        (error: unknown, user: UserDocument | false | undefined) => {
            if (error) return next(error);

            if (!user) return next(new HttpError(401, 'INVALID_REFRESH_TOKEN'));

            res.locals.user = user;
            next();
        }
    )(req, res, next);
};

export default refresh;
