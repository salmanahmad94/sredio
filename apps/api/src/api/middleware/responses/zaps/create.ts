import type { ZapInput } from '@sredio/shared';
import type { RequestHandler } from 'express';

import { container } from '../../../../loaders/container';
import { toZap } from '../../../../utils/modifiers';

const create: RequestHandler = async (req, res) => {
    const zap = await container.zapService.create(req.user!.id, req.body as ZapInput);

    container.logger.verbose(`${req.user!.login} created Zap ${zap.id}.`, { label: 'ZAPS' });

    res.status(201).json({ zap: toZap(zap) });
};

export default create;
