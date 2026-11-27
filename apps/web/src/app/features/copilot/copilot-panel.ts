import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api/api.service';
import { toApiError } from '../../core/api/api-error';

/** Natural language → draft Zap. The draft opens in the editor, turned off, for review. */
@Component({
    selector: 'app-copilot-panel',
    imports: [FormsModule],
    template: `
        <form class="flex flex-col gap-2 sm:flex-row" (ngSubmit)="draft()">
            <input
                class="w-full min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 focus:border-accent focus:ring-3 focus:ring-accent/25 focus:outline-none disabled:opacity-55 dark:border-zinc-700 dark:bg-zinc-900"
                name="prompt"
                placeholder="Describe a Zap, e.g. “When a pull request is opened, comment thanks.”"
                autocomplete="off"
                [(ngModel)]="prompt"
                [disabled]="busy()"
                aria-label="Describe a Zap for the Copilot to draft"
            />
            <button
                type="submit"
                class="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 font-semibold whitespace-nowrap hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-55 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                [disabled]="busy()"
            >
                {{ busy() ? 'Drafting…' : 'Draft with Copilot' }}
            </button>
        </form>

        @if (error()) {
            <p
                class="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                role="alert"
            >
                {{ error() }}
            </p>
        }
    `
})
export class CopilotPanel {
    private readonly api = inject(ApiService);
    private readonly router = inject(Router);

    protected readonly prompt = signal('');
    protected readonly busy = signal(false);
    protected readonly error = signal<string | null>(null);

    protected async draft(): Promise<void> {
        const prompt = this.prompt().trim();

        // Same rule as the API, answered without a round trip.
        if (prompt.length < 3) {
            this.error.set('Describe the Zap you want.');
            return;
        }

        this.busy.set(true);
        this.error.set(null);

        try {
            const draft = await this.api.draftZap(prompt);
            await this.router.navigate(['/zaps/new'], { state: { draft } });
        } catch (error) {
            this.error.set(toApiError(error).message);
        } finally {
            this.busy.set(false);
        }
    }
}
