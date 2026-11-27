import type { ZapInput } from '@sredio/shared';

import type { ZapDocument, ZapModel } from '../models/zap';

/**
 * CRUD for Zaps. Adding and removing the GitHub webhook behind a Zap that's turned on arrives
 * with the GitHub integration.
 */
export default class ZapService {
    constructor(private readonly zaps: ZapModel) {}

    listForOwner(ownerId: string): Promise<ZapDocument[]> {
        return this.zaps.find({ owner: ownerId }).sort({ updatedAt: -1 }).exec();
    }

    findById(id: string): Promise<ZapDocument | null> {
        return this.zaps.findById(id).exec();
    }

    create(ownerId: string, input: ZapInput): Promise<ZapDocument> {
        return this.zaps.create({ ...input, owner: ownerId });
    }

    /** Replaces the Zap's settings. Steps are replaced whole, since Mongoose can't track changes inside them. */
    update(zap: ZapDocument, input: ZapInput): Promise<ZapDocument> {
        zap.set({
            name: input.name,
            enabled: input.enabled,
            trigger: input.trigger,
            action: input.action
        });

        return zap.save();
    }

    async remove(zap: ZapDocument): Promise<void> {
        await zap.deleteOne();
    }
}
