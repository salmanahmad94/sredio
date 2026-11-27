import { z } from 'zod';

import type { ZapInput } from './zap';

// Runtime validation lives in its own entry point (`@sredio/shared/schemas`) so the web app,
// which only needs the types and the catalog, doesn't bundle zod.

const stepSchema = z.object({
    app: z.string().min(1),
    key: z.string().min(1),
    config: z.record(z.string(), z.string().max(5000)).default({})
});

export const zapInputSchema = z.object({
    name: z.string().trim().min(1, 'Name is required.').max(100),
    enabled: z.boolean().default(false),
    trigger: stepSchema,
    action: stepSchema
}) satisfies z.ZodType<ZapInput, unknown>;
