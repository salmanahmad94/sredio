/**
 * Event names for the in-process pub/sub. Subscribers handle side effects that may be lost
 * without harm; anything that must happen goes through a job instead.
 */
export const events = {
    auth: {
        LOGIN: 'auth.login'
    },
    zaps: {
        RUN_FINISHED: 'zaps.runFinished'
    }
} as const;
