import authWall from './authentication/authWall';
import githubCallback from './authentication/githubCallback';
import githubLogin from './authentication/githubLogin';
import refresh from './authentication/refresh';
import exchange from './responses/auth/exchange';
import githubCallbackResponse from './responses/auth/githubCallback';
import logout from './responses/auth/logout';
import me from './responses/auth/me';
import refreshResponse from './responses/auth/refresh';
import * as rules from './validation/rules';
import { body } from './validation/validate';

// Every middleware, grouped by lifecycle step: authenticate → validate → load → permit → respond.

export const Authentication = {
    authWall,
    githubLogin,
    githubCallback,
    refresh
};

export const Validation = {
    body,
    rules
};

export const Responses = {
    Auth: {
        githubCallback: githubCallbackResponse,
        exchange,
        refresh: refreshResponse,
        me,
        logout
    }
};
