import HttpError from '../errors/HttpError';

import pullRequestOpened from './github/triggers/pullRequestOpened';
import type { TriggerRuntime } from './types';

// Keys are `<app>.<trigger key>`, matching the catalog in @sredio/shared.

const triggers: Record<string, TriggerRuntime> = {
    'github.pull_request_opened': pullRequestOpened
};

export const getTrigger = (app: string, key: string): TriggerRuntime => {
    const trigger = triggers[`${app}.${key}`];

    if (!trigger) throw new HttpError(422, `The trigger "${app}.${key}" can't run yet.`);

    return trigger;
};
