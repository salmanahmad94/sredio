import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';

const zapRunSchema = new Schema(
    {
        zap: { type: Schema.Types.ObjectId, ref: 'Zap', required: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        // GitHub's X-GitHub-Delivery header. Unique per Zap so a redelivered webhook is ignored.
        deliveryId: { type: String, required: true },

        status: {
            type: String,
            enum: ['queued', 'retrying', 'succeeded', 'failed'],
            default: 'queued'
        },
        summary: { type: String, default: '' },
        sourceUrl: { type: String, default: null },
        outputUrl: { type: String, default: null },
        error: { type: String, default: null },
        attempts: { type: Number, default: 0 },

        // The trigger payload the action renders its fields from.
        payload: { type: Schema.Types.Mixed, select: false },

        finishedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

zapRunSchema.index({ zap: 1, deliveryId: 1 }, { unique: true });
zapRunSchema.index({ zap: 1, createdAt: -1 });

// Run history (and the payload each run keeps) is deleted by MongoDB after 30 days.
zapRunSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export type ZapRunAttributes = InferSchemaType<typeof zapRunSchema>;
export type ZapRunDocument = HydratedDocument<ZapRunAttributes>;

const ZapRun = model('ZapRun', zapRunSchema);

export type ZapRunModel = typeof ZapRun;

export default ZapRun;
