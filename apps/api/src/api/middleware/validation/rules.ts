import { zapInputSchema } from '@sredio/shared/schemas';
import { z } from 'zod';

export const zap = zapInputSchema;

export const loginCode = z.object({
    code: z.string().min(1).max(200)
});

export const copilotPrompt = z.object({
    prompt: z.string().trim().min(3, 'Describe the Zap you want.').max(1000)
});
