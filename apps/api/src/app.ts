import express from 'express';
import morgan from 'morgan';

import config from './config';
import { logFormat } from './config/morgan';
import logger from './config/winston';

const app = express();

// Log every request through Winston.

app.use(
    morgan(logFormat, {
        stream: { write: (message) => logger.http(message.trim(), { label: 'HTTP' }) }
    })
);

// Health check.

app.get('/status', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(config.app.port, () => {
    logger.info(`HTTP server started on port ${config.app.port}.`, { label: 'APP' });
});
