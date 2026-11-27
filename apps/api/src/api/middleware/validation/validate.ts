import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

import HttpError from '../../../errors/HttpError';

/**
 * Validates the request body against a zod schema and replaces it with the parsed value
 * (trimmed strings, defaults applied). Fails with 422 and one entry per problem.
 */
export const body =
    (schema: ZodType): RequestHandler =>
    (req, _res, next) => {
        const result = schema.safeParse(req.body ?? {});

        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message
            }));

            return next(new HttpError(422, 'Some fields are invalid.', details));
        }

        req.body = result.data;
        next();
    };
