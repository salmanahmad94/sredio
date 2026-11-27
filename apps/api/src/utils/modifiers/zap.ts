import type { Zap, ZapStep } from '@sredio/shared';

import type { ZapDocument } from '../../models/zap';

const step = (value: { app: string; key: string; config?: unknown }): ZapStep => ({
    app: value.app,
    key: value.key,
    config: { ...((value.config as Record<string, string> | undefined) ?? {}) }
});

export default (zap: ZapDocument): Zap => ({
    id: zap.id,
    name: zap.name,
    enabled: zap.enabled,
    trigger: step(zap.trigger),
    action: step(zap.action),
    lastRunAt: zap.lastRunAt?.toISOString() ?? null,
    runCount: zap.runCount,
    createdAt: zap.createdAt.toISOString(),
    updatedAt: zap.updatedAt.toISOString()
});
