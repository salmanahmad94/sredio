import type { RequestHandler } from 'express';
import passport from 'passport';

import HttpError from '../../../errors/HttpError';

/**
 * Requires a valid access token: the claim in `Authorization: Bearer <claim>` plus the
 * signature cookie. Puts the user on req.user.
 */
const authWall: RequestHandler = (req, res, next) => {
    passport.authenticate(
        'access',
        { session: false },
        (error: unknown, user: Express.User | false | undefined) => {
            // An error occurred while looking up the user.

            if (error) return next(error);

            // No token, an expired one, or the user no longer exists.

            if (!user) return next(new HttpError(401, 'Unauthorized.'));

            req.user = user;
            next();
        }
    )(req, res, next);
};

export default authWall;
