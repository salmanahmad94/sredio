import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { verifySignature } from '../src/utils/github/verifySignature';

const sign = (secret: string, body: Buffer) =>
    `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

describe('verifySignature', () => {
    const secret = 'webhook-secret';
    const body = Buffer.from(JSON.stringify({ action: 'opened' }));

    it('accepts a signature made with the secret', () => {
        expect(verifySignature(secret, body, sign(secret, body))).toBe(true);
    });

    it('rejects a different secret, a changed body, or no header', () => {
        expect(verifySignature(secret, body, sign('other', body))).toBe(false);
        expect(verifySignature(secret, Buffer.from('{}'), sign(secret, body))).toBe(false);
        expect(verifySignature(secret, body, undefined)).toBe(false);
        expect(verifySignature(secret, body, 'sha1=abc')).toBe(false);
    });
});
