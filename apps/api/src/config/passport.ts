import passport from 'passport';
import { Strategy as GitHubStrategy, type Profile } from 'passport-github2';

import { container } from '../loaders/container';
import { OAuthStateStore } from '../utils/auth/oauthStateStore';

import config from './index';

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
};
