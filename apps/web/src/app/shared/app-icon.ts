import { Component, computed, input } from '@angular/core';

// Brand-ish colour and initials for each app in the catalog. Plain tiles, no logos.
const APPS: Record<string, { color: string; initials: string }> = {
    github: { color: '#24292f', initials: 'GH' },
    gitlab: { color: '#e24329', initials: 'GL' },
    jira: { color: '#0052cc', initials: 'J' },
    linear: { color: '#5e6ad2', initials: 'L' },
    slack: { color: '#4a154b', initials: 'S' },
    sentry: { color: '#362d59', initials: 'Se' },
    vercel: { color: '#000000', initials: '▲' }
};

@Component({
    selector: 'app-icon',
    template: `
        <span
            class="grid size-7 flex-none place-items-center rounded-md text-xs font-bold text-white dark:ring-1 dark:ring-zinc-600"
            [style.background]="meta().color"
            aria-hidden="true"
            >{{ meta().initials }}</span
        >
    `
})
export class AppIcon {
    readonly app = input.required<string>();

    protected readonly meta = computed(
        () =>
            APPS[this.app()] ?? { color: '#6b7280', initials: this.app().slice(0, 2).toUpperCase() }
    );
}
