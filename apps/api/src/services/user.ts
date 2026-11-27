import type { Logger } from '../config/winston';
import type { UserDocument, UserModel } from '../models/user';
import { decrypt, encrypt } from '../utils/crypto';

export interface GithubIdentity {
    githubId: string;
    login: string;
    name: string | null;
    avatarUrl: string | null;
    accessToken: string;
    scopes: string[];
}

export default class UserService {
    constructor(
        private readonly users: UserModel,
        private readonly logger: Logger
    ) {}

    /** Creates the user on first sign-in, and refreshes their profile and token after that. */
    async upsertFromGithub(identity: GithubIdentity): Promise<UserDocument> {
        const { accessToken, ...profile } = identity;

        const user = await this.users.findOneAndUpdate(
            { githubId: identity.githubId },
            { $set: { ...profile, accessToken: encrypt(accessToken) } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        this.logger.verbose(`Signed in with GitHub: ${user.login}`, { label: 'AUTH' });

        return user;
    }

    findById(id: string): Promise<UserDocument | null> {
        return this.users.findById(id).exec();
    }

    async getAccessToken(userId: string): Promise<string> {
        const user = await this.users.findById(userId).select('+accessToken').exec();

        if (!user) throw new Error(`User ${userId} not found.`);

        return decrypt(user.accessToken);
    }

    async touchLastLogin(userId: string): Promise<void> {
        await this.users.updateOne({ _id: userId }, { $set: { lastLogin: new Date() } });
    }

    /** Revokes every token issued to the user so far. */
    async revokeSessions(userId: string): Promise<void> {
        await this.users.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
    }
}
