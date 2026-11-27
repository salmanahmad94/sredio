import type { Express } from 'express';

import containerLoader from './container';
import expressLoader from './express';
import mongooseLoader from './mongoose';

export default async (app: Express) => {
    // Connect to MongoDB. Throws if it can't, which stops the boot.

    await mongooseLoader();

    // Build every service with its dependencies.

    const container = containerLoader();

    // Middleware, routes and error handling.

    expressLoader(app);

    return container;
};
