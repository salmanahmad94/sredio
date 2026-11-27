import { Router } from 'express';

import apps from './routes/apps';
import auth from './routes/auth';
import copilot from './routes/copilot';
import github from './routes/github';
import zaps from './routes/zaps';

/** Sign-in routes, mounted at the root so GitHub's callback URL stays short: /auth/... */
export const authRoutes = (): Router => {
    const router = Router();

    auth(router);

    return router;
};

/** The JSON API used by the web app, mounted at /api. */
export default (): Router => {
    const api = Router();

    zaps(api);
    apps(api);
    github(api);
    copilot(api);

    return api;
};
