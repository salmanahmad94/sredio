import type { Agenda } from 'agenda';

import { jobs } from '../../declarations';
import { githubStatus } from '../../integrations/github/client';
import { getAction } from '../../integrations/registry';
import { PermanentError } from '../../integrations/types';
import { container } from '../../loaders/container';
import type { RunZapJobData } from '../../services/scheduler';

const MAX_RETRIES = 4;

const isPermanent = (error: Error): boolean => {
    if (error instanceof PermanentError) return true;

    const status = githubStatus(error);
    return (
        status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429
    );
};

/**
 * Runs a Zap's action for one trigger event: e.g. posts the comment on the pull request that
 * was just opened. Transient failures retry with exponential backoff (5s, 10s, 20s, 40s);
 * failures a retry can't fix stop immediately.
 */
export default (agenda: Agenda) => {
    agenda.define<RunZapJobData>(
        jobs.zaps.RUN_ZAP,
        async (job) => {
            const { runId } = job.attrs.data;
            const attempt = (job.attrs.failCount ?? 0) + 1;

            const run = await container.zapRunService.findWithPayload(runId);

            // The Zap and its history were deleted while this was queued.

            if (!run) return;

            const zap = await container.zapService.findById(run.zap.toString());

            if (!zap) throw new PermanentError('The Zap was deleted before it could run.');

            try {
                const token = await container.userService.getAccessToken(zap.owner.toString());

                const output = await getAction(zap.action.app, zap.action.key).run({
                    token,
                    config: (zap.action.config ?? {}) as Record<string, string>,
                    payload: run.payload
                });

                await container.zapRunService.markSucceeded(runId, output.url, attempt);

                container.broadcastService.runFinished({
                    zapId: zap.id,
                    runId,
                    status: 'succeeded'
                });

                container.logger.verbose(`Run ${runId} of Zap ${zap.id} succeeded: ${output.url}`, {
                    label: 'JOB'
                });
            } catch (error) {
                await container.zapRunService.markRetrying(
                    runId,
                    (error as Error).message,
                    attempt
                );
                throw error;
            }
        },
        {
            concurrency: 5,
            backoff: ({ attempt, error }) =>
                isPermanent(error) || attempt > MAX_RETRIES ? null : 5000 * 2 ** (attempt - 1)
        }
    );

    // No retries left (or the failure was permanent): record the run as failed.

    agenda.on(`retry exhausted:${jobs.zaps.RUN_ZAP}`, async (error: Error, job) => {
        const { runId } = job.attrs.data as RunZapJobData;

        try {
            const run = await container.zapRunService.findWithPayload(runId);

            if (!run) return;

            await container.zapRunService.markFailed(runId, error.message);

            container.broadcastService.runFinished({
                zapId: run.zap.toString(),
                runId,
                status: 'failed'
            });

            container.logger.error(`Run ${runId} failed: ${error.message}`, { label: 'JOB' });
        } catch (markError) {
            container.logger.error(
                `Couldn't record failed run ${runId}: ${(markError as Error).message}`,
                {
                    label: 'JOB'
                }
            );
        }
    });
};
