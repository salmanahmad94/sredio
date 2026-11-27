import { z } from 'zod';

/**
 * Every environment variable the API reads, validated once at boot. A missing or malformed
 * value stops the app with a readable message instead of failing later at first use.
 */

const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),

    LOG_DIRECTORY: z.string().default('logs')
});

export type Env = z.infer<typeof schema>;

export const parseEnv = (source: NodeJS.ProcessEnv): Env => {
    // `KEY=` in .env means "not set", not an empty value.
    const defined = Object.fromEntries(
        Object.entries(source).filter(([, value]) => value !== undefined && value.trim() !== '')
    );

    const result = schema.safeParse(defined);

    if (!result.success) {
        const problems = result.error.issues
            .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');

        throw new Error(`Invalid environment variables:\n${problems}`);
    }

    return result.data;
};
