import type { RequestHandler } from 'express';

import { getTrigger } from '../../integrations/registry';
import { container } from '../../loaders/container';

/**
 * Accepts a verified GitHub delivery and records it as a queued run. Calling GitHub back runs
 * in a job, so this answers well within GitHub's 10 second limit, and deliveries the Zap
 * doesn't care about still get a 2xx so they don't show up as failures in the webhook log.
 */
const github: RequestHandler = async (_req, res) => {
    const zap = res.locals.zap!;
    const event = res.locals.event!;

    // GitHub pings a webhook right after it's created.

    if (event.name === 'ping') {
        res.status(200).json({ status: 'pong' });
        return;
    }

    if (!zap.enabled) {
        res.status(202).json({ status: 'ignored', reason: 'zap_off' });
        return;
    }

    const trigger = getTrigger(zap.trigger.app, zap.trigger.key);
    const config = (zap.trigger.config ?? {}) as Record<string, string>;

    if (!trigger.matches(event, config)) {
        res.status(202).json({ status: 'ignored', reason: 'no_match' });
        return;
    }

    const { summary, url } = trigger.describe(event.payload);

    const run = await container.zapRunService.createQueued({
        zapId: zap.id,
        ownerId: zap.owner.toString(),
        deliveryId: event.deliveryId,
        summary,
        sourceUrl: url,
        payload: event.payload
    });

    // Redelivered (e.g. from GitHub's "Redeliver" button): already handled.

    if (!run) {
        res.status(200).json({ status: 'duplicate' });
        return;
    }

    container.logger.verbose(`Queued run ${run.id} for Zap ${zap.id}: ${summary}`, {
        label: 'WEBHOOKS'
    });

    res.status(202).json({ status: 'queued', runId: run.id });
};

export default github;
