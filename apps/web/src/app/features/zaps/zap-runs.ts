import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import type { ZapRun, ZapRunStatus } from '@sredio/shared';

import { ApiService } from '../../core/api/api.service';
import { toApiError } from '../../core/api/api-error';
import { TimeAgoPipe } from '../../shared/time-ago.pipe';

const REFRESH_MS = 5000;

const BADGE: Record<ZapRunStatus, string> = {
    queued: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
    retrying: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    succeeded: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
};

/** Recent runs of a Zap. Refreshes on its own while the Zap is on. */
@Component({
    selector: 'app-zap-runs',
    imports: [TimeAgoPipe],
    template: `
        <section
            class="mt-6 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
            <div class="flex items-center justify-between">
                <h2 class="font-semibold">Recent runs</h2>
                <button
                    type="button"
                    class="cursor-pointer rounded-lg px-2.5 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    (click)="load()"
                >
                    Refresh
                </button>
            </div>

            @if (error()) {
                <p
                    class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                    role="alert"
                >
                    {{ error() }}
                </p>
            }

            @if (runs(); as runs) {
                @if (runs.length) {
                    <ul class="flex flex-col">
                        @for (run of runs; track run.id) {
                            <li
                                class="flex items-baseline gap-3 border-t border-zinc-200 py-2.5 dark:border-zinc-800"
                            >
                                <span
                                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                                    [class]="badge[run.status]"
                                    >{{ run.status }}</span
                                >
                                <span class="flex min-w-0 flex-1 flex-col wrap-anywhere">
                                    @if (run.sourceUrl) {
                                        <a
                                            class="hover:text-accent"
                                            [href]="run.sourceUrl"
                                            target="_blank"
                                            rel="noopener"
                                            >{{ run.summary }}</a
                                        >
                                    } @else {
                                        {{ run.summary }}
                                    }
                                    @if (run.error) {
                                        <span class="text-sm text-red-600 dark:text-red-400">{{
                                            run.error
                                        }}</span>
                                    }
                                </span>
                                <span
                                    class="text-sm whitespace-nowrap text-zinc-500 dark:text-zinc-400"
                                >
                                    @if (run.outputUrl) {
                                        <a
                                            class="hover:text-accent"
                                            [href]="run.outputUrl"
                                            target="_blank"
                                            rel="noopener"
                                            >View comment</a
                                        >
                                        ·
                                    }
                                    {{ run.createdAt | timeAgo }}
                                </span>
                            </li>
                        }
                    </ul>
                } @else {
                    <p class="text-sm text-zinc-500 dark:text-zinc-400">
                        No runs yet. Turn the Zap on and open a pull request on the repository.
                    </p>
                }
            }
        </section>
    `
})
export class ZapRuns {
    private readonly api = inject(ApiService);

    readonly zapId = input.required<string>();
    readonly live = input(false);

    protected readonly badge = BADGE;
    protected readonly runs = signal<ZapRun[] | null>(null);
    protected readonly error = signal<string | null>(null);

    constructor() {
        effect(() => {
            this.zapId();
            void this.load();
        });

        const timer = setInterval(() => {
            if (this.live()) void this.load();
        }, REFRESH_MS);

        inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }

    async load(): Promise<void> {
        try {
            this.runs.set(await this.api.listRuns(this.zapId()));
            this.error.set(null);
        } catch (error) {
            this.error.set(toApiError(error).message);
        }
    }
}
