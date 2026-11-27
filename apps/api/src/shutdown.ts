import type { Server } from 'node:http';

import mongoose from 'mongoose';

import logger from './config/winston';
import type { Container } from './loaders/container';

const DRAIN_TIMEOUT_MS = 10_000;

/**
 * Stops in reverse boot order: stop taking requests, let running jobs finish, then close the
 * database. Handles Ctrl+C, container/PM2 SIGTERM, and PM2's 'shutdown' message on Windows.
 */
export default (server: Server, container: Container) => {
    let shuttingDown = false;

    const shutdown = async (reason: string) => {
        if (shuttingDown) return;
        shuttingDown = true;

        logger.info(`Shutting down (${reason}).`, { label: 'APP' });

        try {
            await new Promise<void>((resolve, reject) =>
                server.close((error) => (error ? reject(error) : resolve()))
            );
            logger.info('HTTP server stopped.', { label: 'APP' });

            await container.agenda.drain(DRAIN_TIMEOUT_MS);
            logger.info('Job queue drained.', { label: 'APP' });

            // This disconnect is intended, so skip the "unexpected disconnect" warning.
            mongoose.connection.removeAllListeners('disconnected');
            await mongoose.disconnect();
            logger.info('MongoDB connection closed.', { label: 'APP' });

            process.exit(0);
        } catch (error) {
            logger.error(`Shutdown failed: ${(error as Error).message}`, { label: 'APP' });
            process.exit(1);
        }
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('message', (message) => {
        if (message === 'shutdown') void shutdown('shutdown message');
    });
};
