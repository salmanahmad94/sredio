import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { AuthService } from './auth.service';

// inject() only works before the first await, so both guards resolve their dependencies first.

export const authGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.ensureLoaded();

    return auth.signedIn() || router.parseUrl('/login');
};

/** Sends signed-in people from the login page straight to their Zaps. */
export const guestGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.ensureLoaded();

    return !auth.signedIn() || router.parseUrl('/zaps');
};
