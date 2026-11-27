import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        // Variables without a default, so modules that read config can be imported in tests.
        env: {
            ENCRYPTION_KEY: Buffer.alloc(32).toString('base64'),
            GITHUB_CLIENT_ID: 'test',
            GITHUB_CLIENT_SECRET: 'test',
            ACCESS_TOKEN_SECRET: 'a'.repeat(32),
            REFRESH_TOKEN_SECRET: 'r'.repeat(32)
        }
    }
});
