import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService, SKIP_AUTH } from './auth.service';

/** Sends the access claim with API calls as `Authorization: Bearer <claim>`. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const claim = inject(AuthService).accessClaim();

    if (req.context.get(SKIP_AUTH) || !claim) return next(req);

    return next(req.clone({ setHeaders: { Authorization: `Bearer ${claim}` } }));
};
