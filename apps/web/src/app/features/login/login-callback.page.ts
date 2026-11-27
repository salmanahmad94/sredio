import { Component, inject, input, type OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

/** Exchanges the one-time code from the GitHub callback for a session. */
@Component({
    selector: 'app-login-callback-page',
    template: `<p class="mt-16 text-center text-zinc-500 dark:text-zinc-400">Signing you in…</p>`
})
export class LoginCallbackPage implements OnInit {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    readonly code = input<string>();

    async ngOnInit(): Promise<void> {
        const code = this.code();

        if (!code) {
            await this.router.navigateByUrl('/login?error=github', { replaceUrl: true });
            return;
        }

        try {
            await this.auth.exchange(code);
            await this.router.navigateByUrl('/zaps', { replaceUrl: true });
        } catch {
            await this.router.navigateByUrl('/login?error=expired', { replaceUrl: true });
        }
    }
}
