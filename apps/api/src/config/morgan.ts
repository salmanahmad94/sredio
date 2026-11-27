import type { Request } from 'express';
import morgan from 'morgan';

// The path without its query string: OAuth and login codes arrive as query parameters and must
// never reach the logs.
morgan.token('path', (req: Request) => (req.originalUrl ?? req.url).split('?')[0]);

export const logFormat =
    ':method :path - STATUS :status - :res[content-length] bytes - :response-time ms :remote-addr';
