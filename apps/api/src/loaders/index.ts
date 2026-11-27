import type { Express } from 'express';

import expressLoader from './express';

export default async (app: Express) => {
    // Middleware, routes and error handling.

    expressLoader(app);
};
