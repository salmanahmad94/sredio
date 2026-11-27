import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import type { User } from '@sredio/shared';
import { firstValueFrom } from 'rxjs';

interface Session {
    user: User;
    accessClaim: string;
    refreshClaim: string;
}

const ACCESS_CLAIM = 'sredio.accessClaim';
const REFRESH_CLAIM = 'sredio.refreshClaim';

/** Marks requests the auth interceptor must leave alone (they manage their own headers). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

const read = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const write = (key: string, value: string | null): void => {
    try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch {
        // Storage unavailable (private mode): the session lasts until the tab closes.
    }
};

/**
 * Holds the signed-in user and the token claims. The API splits each JWT: the signature lives
 * in an httpOnly cookie the browser sends automatically, and the claim (header.payload) is
 * kept here and sent as `Authorization: Bearer <claim>`. Neither half works alone.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);

    private readonly currentUser = signal<User | null>(null);
    private loaded: Promise<void> | null = null;

    readonly user = this.currentUser.asReadonly();
    readonly signedIn = computed(() => this.currentUser() !== null);

    accessClaim(): string | null {
        return read(ACCESS_CLAIM);
    }

    /** Loads the user once per page load, if there's a stored session. */
    ensureLoaded(): Promise<void> {
        this.loaded ??= this.loadUser();
        return this.loaded;
    }

    /** Starts GitHub sign-in. The API redirects to GitHub and back to /login/callback. */
    signIn(): void {
        window.location.assign('/auth/github');
    }

    async exchange(code: string): Promise<void> {
        const session = await firstValueFrom(
            this.http.post<Session>('/auth/exchange', { code }, { context: this.skipAuth() })
        );

        this.store(session);
        this.loaded = Promise.resolve();
    }

    /** Drops the session locally. */
    clear(): void {
        write(ACCESS_CLAIM, null);
        write(REFRESH_CLAIM, null);
        this.currentUser.set(null);
        this.loaded = Promise.resolve();
    }

    private async loadUser(): Promise<void> {
        if (!read(ACCESS_CLAIM)) return;

        try {
            const { user } = await firstValueFrom(this.http.get<{ user: User }>('/auth/me'));
            this.currentUser.set(user);
        } catch {
            this.clear();
        }
    }

    private store(session: Session): void {
        write(ACCESS_CLAIM, session.accessClaim);
        write(REFRESH_CLAIM, session.refreshClaim);
        this.currentUser.set(session.user);
    }

    private skipAuth(): HttpContext {
        return new HttpContext().set(SKIP_AUTH, true);
    }
}
