import type { Server } from 'node:http';

import logger from './config/winston';

/**
 * Stops in reverse boot order, starting with no longer taking requests. Handles Ctrl+C,
 * container/PM2 SIGTERM, and PM2's 'shutdown' message on Windows.
 */
export default (server: Server) => {
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
