import type { CookieOptions, Response } from 'express';

import config from '../../config';

export const ACCESS_SIGNATURE_COOKIE = 'accessSignature';
export const REFRESH_SIGNATURE_COOKIE = 'refreshSignature';

// The refresh signature is only ever sent to the refresh endpoint.
const REFRESH_COOKIE_PATH = '/auth/refresh';

const baseOptions = (): CookieOptions => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: config.auth.cookies.secure
});

export const setSignatureCookies = (
    res: Response,
    signatures: { access: string; refresh: string }
): void => {
    res.cookie(ACCESS_SIGNATURE_COOKIE, signatures.access, {
        ...baseOptions(),
        path: '/',
        maxAge: config.auth.accessToken.ttlSeconds * 1000
    });

    res.cookie(REFRESH_SIGNATURE_COOKIE, signatures.refresh, {
        ...baseOptions(),
        path: REFRESH_COOKIE_PATH,
        maxAge: config.auth.refreshToken.ttlSeconds * 1000
    });
};

export const clearSignatureCookies = (res: Response): void => {
    res.clearCookie(ACCESS_SIGNATURE_COOKIE, { ...baseOptions(), path: '/' });
    res.clearCookie(REFRESH_SIGNATURE_COOKIE, { ...baseOptions(), path: REFRESH_COOKIE_PATH });
};
