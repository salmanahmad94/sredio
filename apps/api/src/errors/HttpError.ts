/**
 * An error that maps to an HTTP response. Thrown (or passed to `next`) anywhere in the request
 * lifecycle and turned into `{ error: { message, details } }` by the final error handler.
 */
export default class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly details?: unknown
    ) {
        super(message);
        this.name = 'HttpError';
    }
}
