import path from 'node:path';

import { createLogger, format, transports } from 'winston';

import config from './index';

const logger = createLogger({
    silent: config.app.env === 'test',
    defaultMeta: { label: 'APP' },
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.Console({
            level: config.app.env === 'production' ? 'verbose' : 'silly',
            format: format.combine(
                format.colorize(),
                format.printf(
                    (info) =>
                        `${info['timestamp']} ${info.level} [${info['label']}]: ${info.message}`
                )
            )
        }),
        new transports.File({
            level: 'silly',
            filename: path.join(config.app.logDirectory, 'sredio.log')
        })
    ]
});

export type Logger = typeof logger;

export default logger;
