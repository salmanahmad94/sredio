/**
 * Agenda job names. Jobs run side effects that must happen, with retries.
 */
export const jobs = {
    zaps: {
        RUN_ZAP: 'zaps.runZap'
    }
} as const;
