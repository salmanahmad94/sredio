import logger, { type Logger } from '../config/winston';

export interface Container {
    logger: Logger;
}

/**
 * Every service, built once at boot with its dependencies passed through the constructor.
 * Middleware, jobs and subscribers read from this object; nothing else constructs services.
 */
export const container = {} as Container;

export default (): Container => Object.assign(container, { logger });
