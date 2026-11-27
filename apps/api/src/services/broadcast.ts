import type { ZapRunStatus } from '@sredio/shared';
import type EventEmitter from 'eventemitter3';

import { events } from '../declarations';
import type { UserDocument } from '../models/user';

export interface LoginEvent {
    userId: string;
}

export interface RunFinishedEvent {
    zapId: string;
    runId: string;
    status: Extract<ZapRunStatus, 'succeeded' | 'failed'>;
}

export default class BroadcastService {
    constructor(private readonly publisher: EventEmitter) {}

    login(user: UserDocument): void {
        this.publisher.emit(events.auth.LOGIN, { userId: user.id } satisfies LoginEvent);
    }

    runFinished(event: RunFinishedEvent): void {
        this.publisher.emit(events.zaps.RUN_FINISHED, event);
    }
}
