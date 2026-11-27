import { Router } from 'express';

import { Authentication, Helpers, Permissions, Responses, Validation } from '../middleware';

export default (api: Router) => {
    const router = Router();

    api.use('/zaps', router);

    router.get('/', Authentication.authWall, Responses.Zaps.list);

    router.post(
        '/',
        Authentication.authWall,
        Validation.body(Validation.rules.zap),
        Validation.zapAgainstCatalog,
        Responses.Zaps.create
    );

    router.get(
        '/:id',
        Authentication.authWall,
        Helpers.Zaps.loadZap,
        Permissions.Zaps.ownsZap,
        Responses.Zaps.get
    );

    router.put(
        '/:id',
        Authentication.authWall,
        Helpers.Zaps.loadZap,
        Permissions.Zaps.ownsZap,
        Validation.body(Validation.rules.zap),
        Validation.zapAgainstCatalog,
        Responses.Zaps.update
    );

    router.delete(
        '/:id',
        Authentication.authWall,
        Helpers.Zaps.loadZap,
        Permissions.Zaps.ownsZap,
        Responses.Zaps.remove
    );

    router.get(
        '/:id/runs',
        Authentication.authWall,
        Helpers.Zaps.loadZap,
        Permissions.Zaps.ownsZap,
        Responses.Zaps.runs
    );
};
