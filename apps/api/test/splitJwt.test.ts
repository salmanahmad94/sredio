import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

import { combineJwt, splitJwt } from '../src/utils/auth/splitJwt';

describe('splitJwt / combineJwt', () => {
    const token = jwt.sign({ sub: 'user-1' }, 'a'.repeat(32), { algorithm: 'HS256' });

    it('round-trips a token through the header and the cookie', () => {
        const { claim, signature } = splitJwt(token);

        expect(claim.split('.')).toHaveLength(2);
        expect(signature).not.toContain('.');
        expect(combineJwt(`Bearer ${claim}`, signature)).toBe(token);
    });

    it('needs both halves', () => {
        const { claim, signature } = splitJwt(token);

        expect(combineJwt(undefined, signature)).toBeNull();
        expect(combineJwt(`Bearer ${claim}`, undefined)).toBeNull();
    });

    it('rejects a full token in the header', () => {
        const { signature } = splitJwt(token);

        expect(combineJwt(`Bearer ${token}`, signature)).toBeNull();
    });
});
