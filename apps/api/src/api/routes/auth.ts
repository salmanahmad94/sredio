import { Router } from 'express';

import { Authentication } from '../middleware';

export default (app: Router) => {
    const router = Router();

    app.use('/auth', router);

    router.get('/github', Authentication.githubLogin);
};
