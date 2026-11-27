import { HttpErrorResponse, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService, SKIP_AUTH } from './auth.service';

const withClaim = (req: HttpRequest<unknown>, claim: string | null) =>
    claim ? req.clone({ setHeaders: { Authorization: `Bearer ${claim}` } }) : req;

/**
 * Sends the access claim with API calls. On a 401 it refreshes the token pair once and
 * retries; if that fails too, the session is over and it goes back to the login page.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.context.get(SKIP_AUTH)) return next(req);

    const auth = inject(AuthService);
    const router = inject(Router);

    return next(withClaim(req, auth.accessClaim())).pipe(
        catchError((error: unknown) => {
            if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
                return throwError(() => error);
            }

            return auth.refresh().pipe(
                catchError((refreshError: unknown) => {
                    auth.clear();
                    void router.navigateByUrl('/login');
                    return throwError(() => refreshError);
                }),
                switchMap((claim) => next(withClaim(req, claim)))
            );
        })
    );
};
