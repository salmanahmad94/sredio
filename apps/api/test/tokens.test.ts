import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

import type { UserDocument } from '../src/models/user';
import { setSignatureCookies } from '../src/utils/auth/signatureCookies';
import { combineJwt } from '../src/utils/auth/splitJwt';
import { issueTokens } from '../src/utils/auth/tokens';

const { access, refresh } = issueTokens({ id: 'user-1', login: 'octocat' } as UserDocument);
const rebuild = (part: { claim: string; signature: string }) =>
    combineJwt(`Bearer ${part.claim}`, part.signature)!;
const verify = (token: string, secret: string) => jwt.verify(token, secret) as jwt.JwtPayload;

describe('issueTokens', () => {
    it('signs a 15 min access token and a 7 day refresh token for the user', () => {
        const payload = verify(rebuild(access), 'a'.repeat(32));
        const refreshPayload = verify(rebuild(refresh), 'r'.repeat(32));

        expect(payload).toMatchObject({ sub: 'user-1', login: 'octocat' });
        expect(payload.exp! - payload.iat!).toBe(15 * 60);
        expect(refreshPayload.exp! - refreshPayload.iat!).toBe(7 * 24 * 60 * 60);
    });

    it('uses separate secrets, so one token can never stand in for the other', () => {
        expect(() => verify(rebuild(refresh), 'a'.repeat(32))).toThrow();
        expect(() => verify(rebuild(access), 'r'.repeat(32))).toThrow();
    });
});

describe('setSignatureCookies', () => {
    it('sets both httpOnly and strict, the refresh one only for /auth/refresh', () => {
        const cookies: Record<string, CookieOptions> = {};
        const res = {
            cookie: (name: string, _: string, options: CookieOptions) => (cookies[name] = options)
        };

        setSignatureCookies(res as unknown as Response, { access: 'a', refresh: 'r' });

        const strict = { httpOnly: true, sameSite: 'strict' };
        expect(cookies['accessSignature']).toMatchObject({ ...strict, path: '/', maxAge: 900_000 });
        expect(cookies['refreshSignature']).toMatchObject({ ...strict, path: '/auth/refresh' });
    });
});
