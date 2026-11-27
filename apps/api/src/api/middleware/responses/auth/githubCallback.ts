import type { RequestHandler } from 'express';

import config from '../../../../config';
import { container } from '../../../../loaders/container';

/**
 * GitHub's callback is a redirect, so tokens can't be returned in a body here. Hand the
 * browser a one-time code instead; the app exchanges it at POST /auth/exchange.
 */
const githubCallback: RequestHandler = async (_req, res) => {
    const user = res.locals.user!;

    const code = await container.loginCodeService.create(user.id);

    await container.userService.touchLastLogin(user.id);

    res.redirect(`${config.app.url}/login/callback?code=${encodeURIComponent(code)}`);
};

export default githubCallback;
