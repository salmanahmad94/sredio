import HttpError from '../errors/HttpError';

import commentOnPullRequest from './github/actions/commentOnPullRequest';
import pullRequestOpened from './github/triggers/pullRequestOpened';
import type { ActionRuntime, TriggerRuntime } from './types';

// Keys are `<app>.<trigger or action key>`, matching the catalog in @sredio/shared.

const triggers: Record<string, TriggerRuntime> = {
    'github.pull_request_opened': pullRequestOpened
};

const actions: Record<string, ActionRuntime> = {
    'github.comment_on_pull_request': commentOnPullRequest
};

export const getTrigger = (app: string, key: string): TriggerRuntime => {
    const trigger = triggers[`${app}.${key}`];

    if (!trigger) throw new HttpError(422, `The trigger "${app}.${key}" can't run yet.`);

    return trigger;
};

export const getAction = (app: string, key: string): ActionRuntime => {
    const action = actions[`${app}.${key}`];

    if (!action) throw new HttpError(422, `The action "${app}.${key}" can't run yet.`);

    return action;
};
