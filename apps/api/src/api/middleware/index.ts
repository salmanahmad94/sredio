import githubCallback from './authentication/githubCallback';
import githubLogin from './authentication/githubLogin';
import githubCallbackResponse from './responses/auth/githubCallback';

// Every middleware, grouped by lifecycle step: authenticate → validate → load → permit → respond.

export const Authentication = {
    githubLogin,
    githubCallback
};

export const Responses = {
    Auth: {
        githubCallback: githubCallbackResponse
    }
};
