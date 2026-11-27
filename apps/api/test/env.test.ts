import { describe, expect, it } from 'vitest';

import { parseEnv } from '../src/config/env';

describe('parseEnv', () => {
    it('applies defaults when nothing is set', () => {
        expect(parseEnv({})).toMatchObject({
            NODE_ENV: 'development',
            PORT: 3000,
            MONGODB_URI: 'mongodb://127.0.0.1:27017/sredio'
        });
    });

    it('treats an empty value as unset', () => {
        expect(parseEnv({ PORT: '', NODE_ENV: '  ' })).toMatchObject({
            PORT: 3000,
            NODE_ENV: 'development'
        });
    });

    it('converts and keeps valid values', () => {
        expect(parseEnv({ PORT: '8080', NODE_ENV: 'production' })).toMatchObject({
            PORT: 8080,
            NODE_ENV: 'production'
        });
    });

    it('names every invalid variable', () => {
        expect(() => parseEnv({ PORT: 'abc', NODE_ENV: 'staging' })).toThrow(
            /PORT[\s\S]*NODE_ENV|NODE_ENV[\s\S]*PORT/
        );
    });
});
