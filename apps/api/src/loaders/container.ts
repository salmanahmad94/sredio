import config from '../config';
import logger, { type Logger } from '../config/winston';
import LoginCode from '../models/loginCode';
import User from '../models/user';
import LoginCodeService from '../services/loginCode';
import UserService from '../services/user';

export interface Container {
    logger: Logger;
    userService: UserService;
    loginCodeService: LoginCodeService;
}

/**
 * Every service, built once at boot with its dependencies passed through the constructor.
 * Middleware, jobs and subscribers read from this object; nothing else constructs services.
 */
export const container = {} as Container;

export default (): Container =>
    Object.assign(container, {
        logger,
        userService: new UserService(User, logger),
        loginCodeService: new LoginCodeService(LoginCode, config.auth.loginCodeTtlSeconds)
    });
