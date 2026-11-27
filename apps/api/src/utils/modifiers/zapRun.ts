import type { ZapRun } from '@sredio/shared';

import type { ZapRunDocument } from '../../models/zapRun';

export default (run: ZapRunDocument): ZapRun => ({
    id: run.id,
    status: run.status,
    summary: run.summary,
    sourceUrl: run.sourceUrl ?? null,
    outputUrl: run.outputUrl ?? null,
    error: run.error ?? null,
    attempts: run.attempts,
    createdAt: run.createdAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null
});
