import type { Response } from 'express';

import type { UserDocument } from '../../../../models/user';
import { setSignatureCookies } from '../../../../utils/auth/signatureCookies';
import { issueTokens } from '../../../../utils/auth/tokens';
import { toUser } from '../../../../utils/modifiers';

/**
 * Issues a fresh token pair: signatures go into httpOnly cookies, claims go in the body. The
 * client sends the access claim back as `Authorization: Bearer <claim>`.
 */
export const sendSession = (res: Response, user: UserDocument, status: number): void => {
    const { access, refresh } = issueTokens(user);

    setSignatureCookies(res, { access: access.signature, refresh: refresh.signature });

    res.status(status).json({
        user: toUser(user),
        accessClaim: access.claim,
        refreshClaim: refresh.claim
    });
};
