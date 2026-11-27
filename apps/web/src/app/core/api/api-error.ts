import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorDetail {
    path: string;
    message: string;
}

export interface ApiError {
    message: string;
    details: ApiErrorDetail[];
}

/** Reads the API's `{ error: { message, details } }` shape, with a fallback for anything else. */
export const toApiError = (error: unknown): ApiError => {
    if (error instanceof HttpErrorResponse) {
        const body = error.error as { error?: { message?: string; details?: unknown } } | null;
        const details = Array.isArray(body?.error?.details)
            ? (body.error.details as ApiErrorDetail[])
            : [];

        if (body?.error?.message) return { message: body.error.message, details };

        if (error.status === 0) {
            return { message: "Can't reach the server. Is the API running?", details: [] };
        }
    }

    return { message: 'Something went wrong. Please try again.', details: [] };
};
