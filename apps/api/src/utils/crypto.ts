import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

import config from '../config';

// Secrets stored in MongoDB (GitHub tokens, webhook secrets) are encrypted with AES-256-GCM, so a
// database dump alone doesn't hand them out.

export const encrypt = (plaintext: string): string => {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', config.crypto.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
};

export const decrypt = (value: string): string => {
    const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64url'));

    if (!iv || !tag || !encrypted) throw new Error('Malformed encrypted value.');

    const decipher = createDecipheriv('aes-256-gcm', config.crypto.key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
};

export const randomToken = (bytes = 32): string => randomBytes(bytes).toString('base64url');

export const hash = (value: string): string => createHash('sha256').update(value).digest('hex');
