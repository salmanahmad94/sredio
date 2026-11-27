/**
 * Runtime side of the catalog. The catalog in @sredio/shared describes what a trigger or action
 * is; these interfaces describe how it runs. Only catalog entries with a runtime can be used.
 */

export interface TriggerEvent {
    name: string;
    deliveryId: string;
    payload: unknown;
}

export interface Subscription {
    hookId: number;
    secret: string;
}

export interface TriggerRuntime {
    /** Starts listening, e.g. by adding a webhook. Called when a Zap is turned on. */
    subscribe(params: {
        token: string;
        config: Record<string, string>;
        webhookUrl: string;
    }): Promise<Subscription>;

    /** Stops listening. Called when a Zap is turned off, changed or deleted. */
    unsubscribe(params: {
        token: string;
        config: Record<string, string>;
        hookId: number;
    }): Promise<void>;

    /** Whether an incoming event should run the Zap. */
    matches(event: TriggerEvent, config: Record<string, string>): boolean;

    /** A one-line description of the event and a link to its source, for the run history. */
    describe(payload: unknown): { summary: string; url: string | null };
}

export interface ActionRuntime {
    run(params: {
        token: string;
        config: Record<string, string>;
        payload: unknown;
    }): Promise<{ url: string | null }>;
}

/** An action failure that retrying won't fix, e.g. a 404 or a missing permission. */
export class PermanentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermanentError';
    }
}
