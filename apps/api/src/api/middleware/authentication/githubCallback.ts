import type { RequestHandler } from 'express';
import passport from 'passport';

import config from '../../../config';
import logger from '../../../config/winston';
import type { UserDocument } from '../../../models/user';

const backToLogin = (reason: string) => `${config.app.url}/login?error=${reason}`;

/**
 * Handles GitHub's redirect back. This is a browser navigation, not an XHR, so failures
 * redirect to the login page instead of returning JSON.
 */
const githubCallback: RequestHandler = (req, res, next) => {
    passport.authenticate(
        'github',
        { session: false },
        (error: unknown, user: UserDocument | false | undefined) => {
            if (error) {
                logger.error(`GitHub sign-in failed: ${(error as Error).message}`, {
                    label: 'AUTH'
                });
                return res.redirect(backToLogin('github'));
            }

            // Cancelled on GitHub, or the state check failed.

            if (!user) return res.redirect(backToLogin('denied'));

            res.locals.user = user;
            next();
        }
    )(req, res, next);
};

export default githubCallback;
