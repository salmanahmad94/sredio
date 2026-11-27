import { Component, inject, signal, type OnInit } from '@angular/core';
import type { Zap } from '@sredio/shared';

import { ApiService } from '../../core/api/api.service';
import { toApiError } from '../../core/api/api-error';
import { AppIcon } from '../../shared/app-icon';
import { TimeAgoPipe } from '../../shared/time-ago.pipe';

@Component({
    selector: 'app-zap-list-page',
    imports: [AppIcon, TimeAgoPipe],
    template: `
        <div class="flex items-center justify-between gap-4">
            <h1 class="text-2xl font-bold">Zaps</h1>
            <button
                type="button"
                class="rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-hover"
            >
                New Zap
            </button>
        </div>

        @if (error()) {
            <p
                class="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                role="alert"
            >
                {{ error() }}
            </p>
        }

        @if (zaps(); as zaps) {
            @if (zaps.length) {
                <ul
                    class="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900"
                >
                    @for (zap of zaps; track zap.id) {
                        <li class="flex flex-wrap items-center gap-3 px-4 py-3">
                            <span class="flex items-center gap-1 text-zinc-400" aria-hidden="true">
                                <app-icon [app]="zap.trigger.app" />→<app-icon
                                    [app]="zap.action.app"
                                />
                            </span>
                            <span class="font-semibold">{{ zap.name }}</span>
                            <code
                                class="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            >
                                {{ zap.trigger.config['repository'] || 'no repository' }}
                            </code>
                            <span
                                class="ml-auto text-sm whitespace-nowrap text-zinc-500 dark:text-zinc-400"
                            >
                                {{
                                    zap.lastRunAt
                                        ? 'Last run ' + (zap.lastRunAt | timeAgo)
                                        : 'Not run yet'
                                }}
                            </span>
                            <label class="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    class="peer sr-only"
                                    [checked]="zap.enabled"
                                    [disabled]="toggling() === zap.id"
                                    (change)="toggle(zap, $any($event.target))"
                                    [attr.aria-label]="
                                        'Turn ' + zap.name + (zap.enabled ? ' off' : ' on')
                                    "
                                />
                                <span
                                    class="h-[22px] w-[38px] rounded-full bg-zinc-300 transition peer-checked:bg-green-600 peer-focus-visible:ring-3 peer-focus-visible:ring-accent/30 peer-disabled:opacity-50 after:absolute after:top-[3px] after:left-[3px] after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4 dark:bg-zinc-700"
                                ></span>
                            </label>

                            @if (rowErrors()[zap.id]; as rowError) {
                                <p
                                    class="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                                    role="alert"
                                >
                                    {{ rowError }}
                                </p>
                            }
                        </li>
                    }
                </ul>
            } @else {
                <div
                    class="mt-6 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <h2 class="text-lg font-semibold">No Zaps yet</h2>
                    <p class="mt-1 text-zinc-500 dark:text-zinc-400">
                        A Zap connects a trigger to an action, like commenting on every pull request
                        opened in a repository.
                    </p>
                </div>
            }
        } @else if (!error()) {
            <p class="mt-6 text-zinc-500 dark:text-zinc-400">Loading…</p>
        }
    `
})
export class ZapListPage implements OnInit {
    private readonly api = inject(ApiService);

    protected readonly zaps = signal<Zap[] | null>(null);
    protected readonly error = signal<string | null>(null);
    protected readonly rowErrors = signal<Record<string, string>>({});
    protected readonly toggling = signal<string | null>(null);

    async ngOnInit(): Promise<void> {
        try {
            this.zaps.set(await this.api.listZaps());
        } catch (error) {
            this.error.set(toApiError(error).message);
        }
    }

    protected async toggle(zap: Zap, input: HTMLInputElement): Promise<void> {
        const enabled = input.checked;

        this.toggling.set(zap.id);
        this.rowErrors.update(({ [zap.id]: _, ...rest }) => rest);

        try {
            const updated = await this.api.updateZap(zap.id, {
                name: zap.name,
                enabled,
                trigger: zap.trigger,
                action: zap.action
            });

            this.zaps.update(
                (zaps) => zaps?.map((item) => (item.id === zap.id ? updated : item)) ?? null
            );
        } catch (error) {
            const { message, details } = toApiError(error);
            const detail = details[0]?.message;

            this.rowErrors.update((errors) => ({
                ...errors,
                [zap.id]: detail ? `${message} ${detail}` : message
            }));
            // Put the switch back.
            input.checked = zap.enabled;
        } finally {
            this.toggling.set(null);
        }
    }
}
