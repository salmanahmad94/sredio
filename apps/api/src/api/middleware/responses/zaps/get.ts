import type { RequestHandler } from 'express';

import { toZap } from '../../../../utils/modifiers';

const get: RequestHandler = (_req, res) => {
    res.status(200).json({ zap: toZap(res.locals.zap!) });
};

export default get;
