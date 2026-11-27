import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
    {
        githubId: { type: String, required: true, unique: true },
        login: { type: String, required: true },
        name: { type: String, default: null },
        avatarUrl: { type: String, default: null },

        // The GitHub OAuth token, encrypted. Used to add webhooks and post comments as the user.
        accessToken: { type: String, required: true, select: false },
        scopes: { type: [String], default: [] },

        lastLogin: { type: Date, default: null },

        // Every token carries the version it was issued with. Bumping it (on logout) revokes all
        // tokens issued before, on every device.
        tokenVersion: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export type UserAttributes = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserAttributes>;

const User = model('User', userSchema);

export type UserModel = typeof User;

export default User;
