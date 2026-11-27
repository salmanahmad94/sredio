import type { RequestHandler } from 'express';

import { sendSession } from './session';

const refresh: RequestHandler = (_req, res) => {
    sendSession(res, res.locals.user!, 201);
};

export default refresh;
