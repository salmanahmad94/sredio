import { randomBytes, timingSafeEqual } from 'node:crypto';

import type { Request } from 'express';
import type { StateStore } from 'passport-oauth2';

import config from '../../config';

const STATE_COOKIE = 'oauthState';
const STATE_COOKIE_PATH = '/auth/github';
const STATE_TTL_MS = 10 * 60 * 1000;

type StoreCallback = (error: Error | null, state?: string) => void;
type VerifyCallback = (error: Error | null, ok: boolean, info?: { message: string }) => void;

// passport-oauth2 passes an optional `meta` argument before the callback.
const lastCallback = <T>(...args: unknown[]): T =>
    args.findLast((arg) => typeof arg === 'function') as T;

/**
 * OAuth `state` kept in a cookie instead of a session: it must come back unchanged in the
 * callback, proving this browser started the sign-in (CSRF protection). SameSite=Lax, because
 * GitHub's redirect back is a cross-site navigation that Strict cookies are withheld from.
 */
export class OAuthStateStore implements StateStore {
    store(req: Request, metaOrCallback: unknown, maybeCallback?: StoreCallback): void {
        const callback = lastCallback<StoreCallback>(metaOrCallback, maybeCallback);
        const state = randomBytes(24).toString('base64url');

        req.res?.cookie(STATE_COOKIE, state, {
            httpOnly: true,
            sameSite: 'lax',
            secure: config.auth.cookies.secure,
            path: STATE_COOKIE_PATH,
            maxAge: STATE_TTL_MS
        });

        callback(null, state);
    }

    verify(
        req: Request,
        providedState: string,
        metaOrCallback: unknown,
        maybeCallback?: VerifyCallback
    ): void {
        const callback = lastCallback<VerifyCallback>(metaOrCallback, maybeCallback);
        const expected = req.cookies?.[STATE_COOKIE] as string | undefined;

        req.res?.clearCookie(STATE_COOKIE, { path: STATE_COOKIE_PATH });

        const valid =
            typeof expected === 'string' &&
            typeof providedState === 'string' &&
            expected.length === providedState.length &&
            timingSafeEqual(Buffer.from(expected), Buffer.from(providedState));

        if (!valid) return callback(null, false, { message: 'Invalid sign-in state.' });

        callback(null, true);
    }
}
