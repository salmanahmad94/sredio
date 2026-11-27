import type { Request } from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy, type Profile } from 'passport-github2';
import { Strategy as JwtStrategy } from 'passport-jwt';

import { container } from '../loaders/container';
import { OAuthStateStore } from '../utils/auth/oauthStateStore';
import { ACCESS_SIGNATURE_COOKIE, REFRESH_SIGNATURE_COOKIE } from '../utils/auth/signatureCookies';
import { combineJwt } from '../utils/auth/splitJwt';
import type { JwtPayload } from '../utils/auth/tokens';

import config from './index';

// Rebuilds the JWT from the claim in the Authorization header and the signature cookie.
const fromSplitToken = (cookieName: string) => (req: Request) =>
    combineJwt(req.headers.authorization, req.cookies?.[cookieName]);

const verifyPayload = async (
    payload: JwtPayload,
    done: (error: unknown, user?: Express.User | false) => void
) => {
    try {
        const user = await container.userService.findById(payload.sub);

        // Tokens issued before the user's last logout are revoked.
        done(null, user && user.tokenVersion === payload.ver ? user : false);
    } catch (error) {
        done(error);
    }
};

export default () => {
    // Sign in with GitHub. The OAuth `state` lives in a short-lived cookie, not a session.

    passport.use(
        'github',
        new GitHubStrategy(
            {
                clientID: config.github.clientId,
                clientSecret: config.github.clientSecret,
                callbackURL: config.github.callbackUrl,
                scope: config.github.scopes,
                store: new OAuthStateStore()
            },
            async (
                accessToken: string,
                _refreshToken: string,
                params: { scope?: string },
                profile: Profile,
                done: (error: unknown, user?: Express.User | false) => void
            ) => {
                try {
                    const user = await container.userService.upsertFromGithub({
                        githubId: profile.id,
                        login: profile.username ?? profile.id,
                        name: profile.displayName || null,
                        avatarUrl: profile.photos?.[0]?.value ?? null,
                        accessToken,
                        scopes: params.scope?.split(',').filter(Boolean) ?? []
                    });

                    done(null, user);
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    // Short-lived access token, sent with every API request.

    passport.use(
        'access',
        new JwtStrategy(
            {
                secretOrKey: config.auth.accessToken.secret,
                algorithms: ['HS256'],
                jwtFromRequest: fromSplitToken(ACCESS_SIGNATURE_COOKIE)
            },
            verifyPayload
        )
    );

    // Long-lived refresh token, only accepted by POST /auth/refresh.

    passport.use(
        'refresh',
        new JwtStrategy(
            {
                secretOrKey: config.auth.refreshToken.secret,
                algorithms: ['HS256'],
                jwtFromRequest: fromSplitToken(REFRESH_SIGNATURE_COOKIE)
            },
            verifyPayload
        )
    );
};
