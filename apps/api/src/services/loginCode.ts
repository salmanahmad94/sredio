import type { LoginCodeModel } from '../models/loginCode';
import { hash, randomToken } from '../utils/crypto';

export default class LoginCodeService {
    constructor(
        private readonly codes: LoginCodeModel,
        private readonly ttlSeconds: number
    ) {}

    async create(userId: string): Promise<string> {
        const code = randomToken();

        await this.codes.create({
            codeHash: hash(code),
            user: userId,
            expiresAt: new Date(Date.now() + this.ttlSeconds * 1000)
        });

        return code;
    }

    /** Returns the user the code was issued to, and deletes it so it can't be used twice. */
    async consume(code: string): Promise<string | null> {
        const loginCode = await this.codes.findOneAndDelete({
            codeHash: hash(code),
            // MongoDB's TTL sweep runs once a minute, so expiry is checked here too.
            expiresAt: { $gt: new Date() }
        });

        return loginCode ? loginCode.user.toString() : null;
    }
}
