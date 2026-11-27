import { Component } from '@angular/core';

@Component({
    selector: 'app-zap-list-page',
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

        <div
            class="mt-6 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
        >
            <h2 class="text-lg font-semibold">No Zaps yet</h2>
            <p class="mt-1 text-zinc-500 dark:text-zinc-400">
                A Zap connects a trigger to an action, like commenting on every pull request opened
                in a repository.
            </p>
        </div>
    `
})
export class ZapListPage {}
