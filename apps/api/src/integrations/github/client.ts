import { Octokit } from '@octokit/rest';

import HttpError from '../../errors/HttpError';

export const githubClient = (token: string): Octokit =>
    new Octokit({ auth: token, userAgent: 'sredio' });

/** The HTTP status of a failed GitHub request, if the error came from one. */
export const githubStatus = (error: unknown): number | undefined =>
    typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status: unknown }).status)
        : undefined;

/** GitHub rejected the stored token, e.g. the user revoked access. Only a new sign-in fixes it. */
export const signInAgainError = (): HttpError =>
    new HttpError(422, "GitHub didn't accept your saved sign-in. Sign out and sign in again.");
