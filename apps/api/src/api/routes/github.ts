import { Router } from 'express';

import { Authentication, Responses } from '../middleware';

export default (api: Router) => {
    const router = Router();

    api.use('/github', router);

    router.get('/repositories', Authentication.authWall, Responses.Github.repositories);
};
