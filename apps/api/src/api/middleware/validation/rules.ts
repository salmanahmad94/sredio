import { zapInputSchema } from '@sredio/shared/schemas';
import { z } from 'zod';

export const zap = zapInputSchema;

export const loginCode = z.object({
    code: z.string().min(1).max(200)
});
