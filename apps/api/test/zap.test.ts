import { validateZap, type ZapInput } from '@sredio/shared';
import { zapInputSchema } from '@sredio/shared/schemas';
import { describe, expect, it } from 'vitest';

const zap = (overrides: Partial<ZapInput> = {}): ZapInput => ({
    name: 'Thank PR authors',
    enabled: true,
    trigger: { app: 'github', key: 'pull_request_opened', config: { repository: 'octo/hello' } },
    action: { app: 'github', key: 'comment_on_pull_request', config: { body: 'Thanks!' } },
    ...overrides
});

const paths = (input: ZapInput) => validateZap(input).map((issue) => issue.path);

describe('validateZap', () => {
    it('accepts the GitHub PR opened → comment Zap', () => {
        expect(validateZap(zap())).toEqual([]);
    });

    it('rejects unknown apps, triggers and fields', () => {
        expect(paths(zap({ trigger: { app: 'gitlab', key: 'mr_opened', config: {} } }))).toContain(
            'trigger'
        );
        expect(
            paths(
                zap({
                    action: { app: 'github', key: 'comment_on_pull_request', config: { x: '1' } }
                })
            )
        ).toContain('action.config.x');
    });

    it('requires fields only when the Zap is on', () => {
        const draft = zap({ enabled: false, trigger: { ...zap().trigger, config: {} } });

        expect(validateZap(draft)).toEqual([]);
        expect(paths({ ...draft, enabled: true })).toContain('trigger.config.repository');
    });

    it('checks the repository format', () => {
        expect(
            paths(zap({ trigger: { ...zap().trigger, config: { repository: 'nope' } } }))
        ).toContain('trigger.config.repository');
    });
});

describe('zapInputSchema', () => {
    it('trims the name and fills defaults', () => {
        const parsed = zapInputSchema.parse({
            name: '  Hi  ',
            trigger: { app: 'github', key: 'pull_request_opened' },
            action: { app: 'github', key: 'comment_on_pull_request' }
        });

        expect(parsed).toMatchObject({ name: 'Hi', enabled: false, trigger: { config: {} } });
    });

    it('rejects a missing name or step', () => {
        expect(zapInputSchema.safeParse({ name: ' ' }).success).toBe(false);
    });
});
