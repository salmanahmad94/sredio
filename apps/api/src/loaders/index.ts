import type { Express } from 'express';

import agendaLoader from './agenda';
import containerLoader from './container';
import expressLoader from './express';
import jobsLoader from './jobs';
import mongooseLoader from './mongoose';
import subscribersLoader from './subscribers';

export default async (app: Express) => {
    // Connect to MongoDB. Throws if it can't, which stops the boot.

    const db = await mongooseLoader();

    // Agenda runs jobs from a collection in the same database.

    const agenda = agendaLoader(db);

    // Build every service with its dependencies.

    const container = containerLoader(agenda);

    // Register job definitions and start processing.

    await jobsLoader(agenda);

    // Register event listeners.

    subscribersLoader();

    // Middleware, routes and error handling.

    expressLoader(app);

    return container;
};
