import { validateZap, type ZapInput } from '@sredio/shared';
import type { RequestHandler } from 'express';

import HttpError from '../../../errors/HttpError';

/** Checks a validated Zap body against the app catalog (known apps, required fields). */
const zapAgainstCatalog: RequestHandler = (req, _res, next) => {
    const issues = validateZap(req.body as ZapInput);

    if (issues.length) return next(new HttpError(422, "This Zap can't be saved yet.", issues));

    next();
};

export default zapAgainstCatalog;
