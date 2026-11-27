import { model, Schema, type InferSchemaType } from 'mongoose';

/**
 * A one-time code that bridges the GitHub callback (a browser redirect, which can't carry a
 * response body) and the token exchange (an XHR, which can). Only the hash is stored.
 */
const loginCodeSchema = new Schema({
    codeHash: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // TTL index: MongoDB deletes the code once it expires.
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

export type LoginCodeAttributes = InferSchemaType<typeof loginCodeSchema>;

const LoginCode = model('LoginCode', loginCodeSchema);

export type LoginCodeModel = typeof LoginCode;

export default LoginCode;
