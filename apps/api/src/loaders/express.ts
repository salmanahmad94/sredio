import cookieParser from 'cookie-parser';
import express, { type ErrorRequestHandler, type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';

import routes, { authRoutes } from '../api';
import { logFormat } from '../config/morgan';
import configurePassport from '../config/passport';
import logger from '../config/winston';
import HttpError from '../errors/HttpError';

export default (app: Express) => {
    // Behind ngrok or a load balancer: trust X-Forwarded-* for the client IP and protocol.

    app.set('trust proxy', 1);

    // Log every request through Winston.

    app.use(
        morgan(logFormat, {
            stream: { write: (message) => logger.http(message.trim(), { label: 'HTTP' }) }
        })
    );

    // Security headers: https://helmetjs.github.io

    app.use(helmet());

    app.use(express.json({ limit: '100kb' }));

    app.use(express.urlencoded({ extended: true }));

    app.use(cookieParser());

    configurePassport();
    app.use(passport.initialize());

    // Health check.

    app.get('/status', (_req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use(authRoutes());

    app.use('/api', routes());

    // No route matched.

    app.use((_req, _res, next) => {
        next(new HttpError(404, 'Not found.'));
    });

    // Every error ends here. Express 5 forwards rejected promises from async handlers too.

    const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
        if (error instanceof HttpError) {
            res.status(error.status).json({
                error: { message: error.message, details: error.details }
            });
            return;
        }

        // Malformed JSON body.

        if ((error as { type?: string }).type === 'entity.parse.failed') {
            res.status(400).json({ error: { message: 'The body is not valid JSON.' } });
            return;
        }

        logger.error((error as Error).stack ?? String(error), { label: 'HTTP' });

        res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } });
    };

    app.use(errorHandler);
};
