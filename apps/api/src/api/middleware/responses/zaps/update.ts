import type { ZapInput } from '@sredio/shared';
import type { RequestHandler } from 'express';

import { container } from '../../../../loaders/container';
import { toZap } from '../../../../utils/modifiers';

const update: RequestHandler = async (req, res) => {
    const zap = await container.zapService.update(res.locals.zap!, req.body as ZapInput);

    res.status(200).json({ zap: toZap(zap) });
};

export default update;
