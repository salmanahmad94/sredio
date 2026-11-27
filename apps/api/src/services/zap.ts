import type { ZapInput, ZapStep } from '@sredio/shared';

import type { Logger } from '../config/winston';
import HttpError from '../errors/HttpError';
import { getTrigger } from '../integrations/registry';
import type { ZapDocument, ZapModel } from '../models/zap';
import { encrypt } from '../utils/crypto';

import type UserService from './user';

interface Step {
    app: string;
    key: string;
    config: Record<string, string>;
}

const toStep = (step: { app: string; key: string; config?: unknown }): Step => ({
    app: step.app,
    key: step.key,
    config: { ...((step.config as Record<string, string> | undefined) ?? {}) }
});

const sameTrigger = (a: Step, b: ZapStep): boolean =>
    a.app === b.app &&
    a.key === b.key &&
    JSON.stringify(Object.entries(a.config).sort()) ===
        JSON.stringify(Object.entries(b.config).sort());

/**
 * Owns a Zap's lifecycle, including the webhook behind its trigger: a Zap that's on has a
 * webhook, and a Zap that's off doesn't. Adding the webhook happens inline rather than in the
 * background, so a missing permission is reported to the person saving the Zap.
 */
export default class ZapService {
    constructor(
        private readonly zaps: ZapModel,
        private readonly users: UserService,
        private readonly publicUrl: string | undefined,
        private readonly logger: Logger
    ) {}

    listForOwner(ownerId: string): Promise<ZapDocument[]> {
        return this.zaps.find({ owner: ownerId }).sort({ updatedAt: -1 }).exec();
    }

    findById(id: string): Promise<ZapDocument | null> {
        return this.zaps.findById(id).exec();
    }

    async create(ownerId: string, input: ZapInput): Promise<ZapDocument> {
        const zap = new this.zaps({ ...input, owner: ownerId });

        if (input.enabled) {
            const token = await this.users.getAccessToken(ownerId);
            zap.hook = await this.subscribe(zap.id, input.trigger, token);
        }

        try {
            return await zap.save();
        } catch (error) {
            await this.rollbackHook(zap, input.trigger, ownerId);
            throw error;
        }
    }

    async update(zap: ZapDocument, input: ZapInput): Promise<ZapDocument> {
        const ownerId = zap.owner.toString();
        const previousTrigger = toStep(zap.trigger);
        const previousHookId = zap.hook?.id ?? null;

        // Keep the existing webhook when the Zap stays on with the same trigger.
        const keepHook =
            previousHookId !== null && input.enabled && sameTrigger(previousTrigger, input.trigger);
        const needsToken = (input.enabled && !keepHook) || (previousHookId !== null && !keepHook);
        const token = needsToken ? await this.users.getAccessToken(ownerId) : '';

        zap.set({
            name: input.name,
            enabled: input.enabled,
            trigger: input.trigger,
            action: input.action
        });

        // Add the new webhook first, so a failure leaves the Zap exactly as it was.
        if (input.enabled && !keepHook)
            zap.hook = await this.subscribe(zap.id, input.trigger, token);
        if (!input.enabled) zap.hook = null;

        try {
            await zap.save();
        } catch (error) {
            if (input.enabled && !keepHook) await this.rollbackHook(zap, input.trigger, ownerId);
            throw error;
        }

        if (previousHookId !== null && !keepHook) {
            await this.unsubscribe(previousTrigger, previousHookId, token);
        }

        return zap;
    }

    async remove(zap: ZapDocument): Promise<void> {
        if (zap.hook) {
            const token = await this.users.getAccessToken(zap.owner.toString());
            await this.unsubscribe(toStep(zap.trigger), zap.hook.id, token);
        }

        await zap.deleteOne();
    }

    private webhookUrl(zapId: string): string {
        if (!this.publicUrl) {
            throw new HttpError(
                503,
                "PUBLIC_URL isn't set, so GitHub can't reach this server. Set it to your ngrok URL and restart the API."
            );
        }

        return `${this.publicUrl}/webhooks/github/${zapId}`;
    }

    private async subscribe(zapId: string, trigger: ZapStep, token: string) {
        const subscription = await getTrigger(trigger.app, trigger.key).subscribe({
            token,
            config: trigger.config,
            webhookUrl: this.webhookUrl(zapId)
        });

        return { id: subscription.hookId, secret: encrypt(subscription.secret) };
    }

    // Removing a webhook is best-effort: the Zap change already happened, and a leftover
    // webhook only produces deliveries that are ignored.
    private async unsubscribe(trigger: Step, hookId: number, token: string): Promise<void> {
        try {
            await getTrigger(trigger.app, trigger.key).unsubscribe({
                token,
                config: trigger.config,
                hookId
            });
        } catch (error) {
            this.logger.warn(`Couldn't remove webhook ${hookId}: ${(error as Error).message}`, {
                label: 'ZAPS'
            });
        }
    }

    private async rollbackHook(zap: ZapDocument, trigger: ZapStep, ownerId: string) {
        if (!zap.hook) return;

        const token = await this.users.getAccessToken(ownerId);
        await this.unsubscribe(toStep(trigger), zap.hook.id, token);
    }
}
