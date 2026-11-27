import config from '../config';
import logger, { type Logger } from '../config/winston';
import LoginCode from '../models/loginCode';
import User from '../models/user';
import Zap from '../models/zap';
import LoginCodeService from '../services/loginCode';
import UserService from '../services/user';
import ZapService from '../services/zap';

export interface Container {
    logger: Logger;
    userService: UserService;
    loginCodeService: LoginCodeService;
    zapService: ZapService;
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
        loginCodeService: new LoginCodeService(LoginCode, config.auth.loginCodeTtlSeconds),
        zapService: new ZapService(Zap)
    });
