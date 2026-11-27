import { describe, expect, it } from 'vitest';

import { parseEnv } from '../src/config/env';

// The variables that have no default.
const required = {
    ENCRYPTION_KEY: Buffer.alloc(32).toString('base64'),
    GITHUB_CLIENT_ID: 'id',
    GITHUB_CLIENT_SECRET: 'secret'
};

describe('parseEnv', () => {
    it('applies defaults for everything else', () => {
        expect(parseEnv(required)).toMatchObject({
            NODE_ENV: 'development',
            PORT: 3000,
            MONGODB_URI: 'mongodb://127.0.0.1:27017/sredio'
        });
    });

    it('treats an empty value as unset', () => {
        expect(parseEnv({ ...required, PORT: '', NODE_ENV: '  ' })).toMatchObject({
            PORT: 3000,
            NODE_ENV: 'development'
        });
    });

    it('converts and keeps valid values', () => {
        expect(parseEnv({ ...required, PORT: '8080', NODE_ENV: 'production' })).toMatchObject({
            PORT: 8080,
            NODE_ENV: 'production'
        });
    });

    it('names every invalid variable', () => {
        expect(() => parseEnv({ ...required, PORT: 'abc', NODE_ENV: 'staging' })).toThrow(
            /PORT[\s\S]*NODE_ENV|NODE_ENV[\s\S]*PORT/
        );
    });

    it('requires a 32-byte encryption key', () => {
        expect(() => parseEnv({})).toThrow('ENCRYPTION_KEY');
        expect(() => parseEnv({ ENCRYPTION_KEY: Buffer.alloc(16).toString('base64') })).toThrow(
            '32 bytes'
        );
    });
});
