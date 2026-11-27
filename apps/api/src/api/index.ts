import { Router } from 'express';

import auth from './routes/auth';

/** Sign-in routes, mounted at the root so GitHub's callback URL stays short: /auth/... */
export const authRoutes = (): Router => {
    const router = Router();

    auth(router);

    return router;
};
