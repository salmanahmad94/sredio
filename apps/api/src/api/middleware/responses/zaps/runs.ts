import type { RequestHandler } from 'express';

import { container } from '../../../../loaders/container';
import { toZapRun } from '../../../../utils/modifiers';

const runs: RequestHandler = async (_req, res) => {
    const zapRuns = await container.zapRunService.listForZap(res.locals.zap!.id);

    res.status(200).json({ runs: zapRuns.map(toZapRun) });
};

export default runs;
