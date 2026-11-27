import { parseEnv } from './env';

const env = parseEnv(process.env);

const config = {
    app: {
        env: env.NODE_ENV,
        port: env.PORT,
        url: env.APP_URL.replace(/\/$/, ''),
        // Where GitHub delivers webhooks. Without it, Zaps can be saved but not turned on.
        publicUrl: env.PUBLIC_URL?.replace(/\/$/, ''),
        logDirectory: env.LOG_DIRECTORY
    },
    mongoose: {
        uri: env.MONGODB_URI
    },
    agenda: {
        collection: env.AGENDA_COLLECTION,
        processEvery: env.AGENDA_PROCESS_EVERY,
        maxConcurrency: env.AGENDA_MAX_CONCURRENCY
    },
    crypto: {
        key: Buffer.from(env.ENCRYPTION_KEY, 'base64')
    },
    auth: {
        accessToken: {
            secret: env.ACCESS_TOKEN_SECRET,
            ttlSeconds: env.ACCESS_TOKEN_TTL_SECONDS
        },
        refreshToken: {
            secret: env.REFRESH_TOKEN_SECRET,
            ttlSeconds: env.REFRESH_TOKEN_TTL_SECONDS
        },
        cookies: {
            secure: env.COOKIE_SECURE
        },
        // One-time code handed to the browser after the GitHub callback and exchanged for tokens.
        loginCodeTtlSeconds: 60
    },
    github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackUrl: `${env.APP_URL.replace(/\/$/, '')}/auth/github/callback`,
        // repo: comment on pull requests (including private repos).
        // admin:repo_hook: add and remove the webhook that triggers a Zap.
        scopes: ['read:user', 'repo', 'admin:repo_hook']
    }
};

export type Config = typeof config;

export default config;
