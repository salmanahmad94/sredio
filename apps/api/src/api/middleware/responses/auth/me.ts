import type { RequestHandler } from 'express';

import { toUser } from '../../../../utils/modifiers';

const me: RequestHandler = (req, res) => {
    res.status(200).json({ user: toUser(req.user!) });
};

export default me;
