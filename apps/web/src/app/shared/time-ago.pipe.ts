import { Pipe, type PipeTransform } from '@angular/core';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60]
];

const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (!value) return '';

        const seconds = (new Date(value).getTime() - Date.now()) / 1000;

        for (const [unit, size] of UNITS) {
            if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
        }

        return 'just now';
    }
}
