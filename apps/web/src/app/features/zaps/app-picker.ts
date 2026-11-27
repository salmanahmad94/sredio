import { Component, input, output } from '@angular/core';
import type { AppDefinition } from '@sredio/shared';

import { AppIcon } from '../../shared/app-icon';

/** Row of app tiles. Apps that can't run yet are shown but can't be picked. */
@Component({
    selector: 'app-app-picker',
    imports: [AppIcon],
    template: `
        <div class="flex flex-wrap gap-1.5" role="radiogroup" [attr.aria-label]="label()">
            @for (app of apps(); track app.key) {
                <button
                    type="button"
                    role="radio"
                    class="inline-flex cursor-pointer items-center gap-2 rounded-lg border py-1 pr-2.5 pl-1 text-sm font-medium focus-visible:ring-3 focus-visible:ring-accent/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55"
                    [class]="
                        app.key === selected()
                            ? 'border-accent bg-orange-50 dark:bg-orange-950/40'
                            : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900'
                    "
                    [attr.aria-checked]="app.key === selected()"
                    [disabled]="app.status !== 'available'"
                    [title]="app.status === 'available' ? app.name : app.name + ' (coming soon)'"
                    (click)="picked.emit(app.key)"
                >
                    <app-icon [app]="app.key" />
                    <span>{{ app.name }}</span>
                    @if (app.status !== 'available') {
                        <span class="text-xs text-zinc-500">Soon</span>
                    }
                </button>
            }
        </div>
    `
})
export class AppPicker {
    readonly apps = input.required<AppDefinition[]>();
    readonly selected = input<string>();
    readonly label = input('Choose an app');
    readonly picked = output<string>();
}
