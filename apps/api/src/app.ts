import express from 'express';

import config from './config';
import logger from './config/winston';
import loaders from './loaders';
import shutdown from './shutdown';

async function init() {
    const app = express();

    // Connect to everything and register middleware and routes. Any failure stops the boot.

    const container = await loaders(app);

    const server = app.listen(config.app.port, () => {
        logger.info(`HTTP server started on port ${config.app.port}.`, { label: 'APP' });
    });

    shutdown(server, container);
}

init().catch((error: Error) => {
    logger.error(error.stack ?? error.message, { label: 'APP' });
    process.exit(1);
});
