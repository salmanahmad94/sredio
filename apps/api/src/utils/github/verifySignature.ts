import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Checks GitHub's `X-Hub-Signature-256` header: an HMAC-SHA256 of the raw request body, keyed
 * with the webhook's secret. Compared in constant time.
 */
export const verifySignature = (
    secret: string,
    body: Buffer,
    header: string | undefined
): boolean => {
    if (!header?.startsWith('sha256=')) return false;

    const expected = Buffer.from(
        `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
    );
    const received = Buffer.from(header);

    return expected.length === received.length && timingSafeEqual(expected, received);
};
