import { events } from '../../declarations';
import { container } from '../../loaders/container';
import type { RunFinishedEvent } from '../../services/broadcast';

// Keeps the "last run" and run count shown in the Zap list up to date.
export default () => {
    container.events.on(events.zaps.RUN_FINISHED, async ({ zapId }: RunFinishedEvent) => {
        try {
            await container.zapService.recordRun(zapId);
        } catch (error) {
            container.logger.warn(
                `Couldn't record a run on Zap ${zapId}: ${(error as Error).message}`,
                {
                    label: 'SUBSCRIBER'
                }
            );
        }
    });
};
