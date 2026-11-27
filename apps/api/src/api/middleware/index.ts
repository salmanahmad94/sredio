import githubLogin from './authentication/githubLogin';

// Every middleware, grouped by lifecycle step: authenticate → validate → load → permit → respond.

export const Authentication = {
    githubLogin
};
