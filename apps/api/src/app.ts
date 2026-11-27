import express from 'express';

import config from './config';
import logger from './config/winston';
import loaders from './loaders';
import shutdown from './shutdown';

async function init() {
    const app = express();

    // Register middleware and routes. Any failure stops the boot.

    await loaders(app);

    const server = app.listen(config.app.port, () => {
        logger.info(`HTTP server started on port ${config.app.port}.`, { label: 'APP' });
    });

    shutdown(server);
}

init().catch((error: Error) => {
    logger.error(error.stack ?? error.message, { label: 'APP' });
    process.exit(1);
});
