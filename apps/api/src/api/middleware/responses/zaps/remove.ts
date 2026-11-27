import type { RequestHandler } from 'express';

import { container } from '../../../../loaders/container';

const remove: RequestHandler = async (_req, res) => {
    await container.zapService.remove(res.locals.zap!);

    res.status(204).end();
};

export default remove;
