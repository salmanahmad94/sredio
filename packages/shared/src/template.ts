/**
 * Field mapping: `{{pull_request.title}}` in an action field is replaced with that value from
 * the trigger's payload. Missing values render as an empty string.
 */

const TOKEN = /\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/g;

const getPath = (source: unknown, path: string): unknown =>
    path
        .split('.')
        .reduce<unknown>(
            (value, key) =>
                value !== null && typeof value === 'object'
                    ? (value as Record<string, unknown>)[key]
                    : undefined,
            source
        );

export const renderTemplate = (template: string, data: unknown): string =>
    template.replace(TOKEN, (_, path: string) => {
        const value = getPath(data, path);
        return value === undefined || value === null ? '' : String(value);
    });

/** Builds a payload from a trigger's sample outputs, for previewing templates. */
export const samplePayload = (
    outputs: { path: string; sample: string }[]
): Record<string, unknown> => {
    const payload: Record<string, unknown> = {};

    for (const { path, sample } of outputs) {
        const keys = path.split('.');
        let node = payload;

        keys.slice(0, -1).forEach((key) => {
            node[key] ??= {};
            node = node[key] as Record<string, unknown>;
        });

        node[keys[keys.length - 1]!] = sample;
    }

    return payload;
};
