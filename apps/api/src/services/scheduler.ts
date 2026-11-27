import type { Agenda } from 'agenda';

import { jobs } from '../declarations';

export interface RunZapJobData {
    runId: string;
}

export default class SchedulerService {
    constructor(private readonly scheduler: Agenda) {}

    async runZap(runId: string): Promise<void> {
        await this.scheduler.now<RunZapJobData>(jobs.zaps.RUN_ZAP, { runId });
    }
}
