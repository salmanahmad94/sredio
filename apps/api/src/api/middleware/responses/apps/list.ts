import { CATALOG } from '@sredio/shared';
import type { RequestHandler } from 'express';

const list: RequestHandler = (_req, res) => {
    res.status(200).json({ apps: CATALOG });
};

export default list;
