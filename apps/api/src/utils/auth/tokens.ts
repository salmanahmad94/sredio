import jwt from 'jsonwebtoken';

import config from '../../config';
import type { UserDocument } from '../../models/user';

import { splitJwt } from './splitJwt';

export interface JwtPayload {
    sub: string;
    login: string;
    ver: number;
}

interface SplitToken {
    claim: string;
    signature: string;
}

/** Issues an access and a refresh token for a user, each split into claim and signature. */
export const issueTokens = (user: UserDocument): { access: SplitToken; refresh: SplitToken } => {
    const payload: JwtPayload = { sub: user.id, login: user.login, ver: user.tokenVersion };
    const { accessToken, refreshToken } = config.auth;

    const access = jwt.sign(payload, accessToken.secret, {
        algorithm: 'HS256',
        expiresIn: accessToken.ttlSeconds
    });

    const refresh = jwt.sign(payload, refreshToken.secret, {
        algorithm: 'HS256',
        expiresIn: refreshToken.ttlSeconds
    });

    return { access: splitJwt(access), refresh: splitJwt(refresh) };
};
