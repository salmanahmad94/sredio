import githubCallback from './authentication/githubCallback';
import githubLogin from './authentication/githubLogin';
import exchange from './responses/auth/exchange';
import githubCallbackResponse from './responses/auth/githubCallback';
import * as rules from './validation/rules';
import { body } from './validation/validate';

// Every middleware, grouped by lifecycle step: authenticate → validate → load → permit → respond.

export const Authentication = {
    githubLogin,
    githubCallback
};

export const Validation = {
    body,
    rules
};

export const Responses = {
    Auth: {
        githubCallback: githubCallbackResponse,
        exchange
    }
};
