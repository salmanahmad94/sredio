import { Router } from 'express';

import { Authentication, Responses, Validation } from '../middleware';

export default (api: Router) => {
    const router = Router();

    api.use('/copilot', router);

    router.post(
        '/drafts',
        Authentication.authWall,
        Validation.body(Validation.rules.copilotPrompt),
        Responses.Copilot.draft
    );
};
