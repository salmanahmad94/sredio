import { mongo } from 'mongoose';

import type { ZapRunDocument, ZapRunModel } from '../models/zapRun';

export interface QueuedRun {
    zapId: string;
    ownerId: string;
    deliveryId: string;
    summary: string;
    sourceUrl: string | null;
    payload: unknown;
}

export default class ZapRunService {
    constructor(private readonly runs: ZapRunModel) {}

    /** Records a run for a webhook delivery. Returns null if this delivery was already recorded. */
    async createQueued(run: QueuedRun): Promise<ZapRunDocument | null> {
        try {
            return await this.runs.create({
                zap: run.zapId,
                owner: run.ownerId,
                deliveryId: run.deliveryId,
                summary: run.summary,
                sourceUrl: run.sourceUrl,
                payload: run.payload
            });
        } catch (error) {
            if (error instanceof mongo.MongoServerError && error.code === 11000) return null;
            throw error;
        }
    }

    findWithPayload(runId: string): Promise<ZapRunDocument | null> {
        return this.runs.findById(runId).select('+payload').exec();
    }

    async markRetrying(runId: string, error: string, attempts: number): Promise<void> {
        await this.runs.updateOne(
            { _id: runId },
            { $set: { status: 'retrying', error, attempts } }
        );
    }

    async markSucceeded(runId: string, outputUrl: string | null, attempts: number): Promise<void> {
        await this.runs.updateOne(
            { _id: runId },
            {
                $set: {
                    status: 'succeeded',
                    outputUrl,
                    attempts,
                    error: null,
                    finishedAt: new Date()
                }
            }
        );
    }

    async markFailed(runId: string, error: string): Promise<void> {
        await this.runs.updateOne(
            { _id: runId },
            { $set: { status: 'failed', error, finishedAt: new Date() } }
        );
    }

    async removeForZap(zapId: string): Promise<void> {
        await this.runs.deleteMany({ zap: zapId });
    }
}
