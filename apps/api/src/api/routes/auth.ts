import { Router } from 'express';

import { Authentication, Responses, Validation } from '../middleware';

export default (app: Router) => {
    const router = Router();

    app.use('/auth', router);

    router.get('/github', Authentication.githubLogin);

    router.get('/github/callback', Authentication.githubCallback, Responses.Auth.githubCallback);

    router.post('/exchange', Validation.body(Validation.rules.loginCode), Responses.Auth.exchange);
};
