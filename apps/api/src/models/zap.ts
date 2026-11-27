import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';

const stepSchema = new Schema(
    {
        app: { type: String, required: true },
        key: { type: String, required: true },
        config: { type: Schema.Types.Mixed, default: {} }
    },
    { _id: false, minimize: false }
);

const hookSchema = new Schema(
    {
        id: { type: Number, required: true },
        // Encrypted. Verifies that webhook deliveries really come from GitHub.
        secret: { type: String, required: true, select: false }
    },
    { _id: false }
);

const zapSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        name: { type: String, required: true },
        enabled: { type: Boolean, default: false },
        trigger: { type: stepSchema, required: true },
        action: { type: stepSchema, required: true },

        // The GitHub webhook backing the trigger. Only present while the Zap is on.
        hook: { type: hookSchema, default: null },

        lastRunAt: { type: Date, default: null },
        runCount: { type: Number, default: 0 }
    },
    { timestamps: true, minimize: false }
);

export type ZapAttributes = InferSchemaType<typeof zapSchema>;
export type ZapDocument = HydratedDocument<ZapAttributes>;

const Zap = model('Zap', zapSchema);

export type ZapModel = typeof Zap;

export default Zap;
