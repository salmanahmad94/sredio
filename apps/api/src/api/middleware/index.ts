import authWall from './authentication/authWall';
import githubCallback from './authentication/githubCallback';
import githubLogin from './authentication/githubLogin';
import refresh from './authentication/refresh';
import loadZap from './helpers/zaps/loadZap';
import ownsZap from './permissions/zaps/ownsZap';
import listApps from './responses/apps/list';
import exchange from './responses/auth/exchange';
import githubCallbackResponse from './responses/auth/githubCallback';
import logout from './responses/auth/logout';
import me from './responses/auth/me';
import refreshResponse from './responses/auth/refresh';
import repositories from './responses/github/repositories';
import createZap from './responses/zaps/create';
import getZap from './responses/zaps/get';
import listZaps from './responses/zaps/list';
import removeZap from './responses/zaps/remove';
import zapRuns from './responses/zaps/runs';
import updateZap from './responses/zaps/update';
import * as rules from './validation/rules';
import { body } from './validation/validate';
import zapAgainstCatalog from './validation/zapAgainstCatalog';

// Every middleware, grouped by lifecycle step: authenticate → validate → load → permit → respond.

export const Authentication = {
    authWall,
    githubLogin,
    githubCallback,
    refresh
};

export const Validation = {
    body,
    rules,
    zapAgainstCatalog
};

export const Helpers = {
    Zaps: { loadZap }
};

export const Permissions = {
    Zaps: { ownsZap }
};

export const Responses = {
    Auth: {
        githubCallback: githubCallbackResponse,
        exchange,
        refresh: refreshResponse,
        me,
        logout
    },
    Zaps: {
        list: listZaps,
        get: getZap,
        create: createZap,
        update: updateZap,
        remove: removeZap,
        runs: zapRuns
    },
    Apps: {
        list: listApps
    },
    Github: {
        repositories
    }
};
