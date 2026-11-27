import type { User } from '@sredio/shared';

import type { UserDocument } from '../../models/user';

export default (user: UserDocument): User => ({
    id: user.id,
    login: user.login,
    name: user.name ?? null,
    avatarUrl: user.avatarUrl ?? null
});
