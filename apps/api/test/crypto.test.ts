import { describe, expect, it } from 'vitest';

import { decrypt, encrypt, hash, randomToken } from '../src/utils/crypto';

describe('crypto', () => {
    it('round-trips a secret, with a fresh IV each time', () => {
        const first = encrypt('gho_token');

        expect(decrypt(first)).toBe('gho_token');
        expect(encrypt('gho_token')).not.toBe(first);
        expect(first).not.toContain('gho_token');
    });

    it('rejects a tampered or malformed value', () => {
        const [iv, tag, data] = encrypt('gho_token').split('.');
        const flipped = data![0] === 'A' ? 'B' : 'A';

        expect(() => decrypt([iv, tag, flipped + data!.slice(1)].join('.'))).toThrow();
        expect(() => decrypt('not-encrypted')).toThrow('Malformed');
    });

    it('hashes deterministically and makes unique random tokens', () => {
        expect(hash('code')).toBe(hash('code'));
        expect(randomToken()).not.toBe(randomToken());
    });
});
