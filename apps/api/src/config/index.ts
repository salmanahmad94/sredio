import { parseEnv } from './env';

const env = parseEnv(process.env);

const config = {
    app: {
        env: env.NODE_ENV,
        port: env.PORT,
        logDirectory: env.LOG_DIRECTORY
    },
    mongoose: {
        uri: env.MONGODB_URI
    }
};

export type Config = typeof config;

export default config;
