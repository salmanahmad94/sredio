import { Router } from 'express';

import { Authentication, Responses } from '../middleware';

export default (api: Router) => {
    const router = Router();

    api.use('/apps', router);

    router.get('/', Authentication.authWall, Responses.Apps.list);
};
