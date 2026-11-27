import type { RequestHandler } from 'express';

import { container } from '../../../../loaders/container';
import { toZap } from '../../../../utils/modifiers';

const list: RequestHandler = async (req, res) => {
    const zaps = await container.zapService.listForOwner(req.user!.id);

    res.status(200).json({ zaps: zaps.map(toZap) });
};

export default list;
