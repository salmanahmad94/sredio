import { z } from 'zod';

export const loginCode = z.object({
    code: z.string().min(1).max(200)
});
