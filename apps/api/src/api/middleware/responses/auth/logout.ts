import type { RequestHandler } from 'express';

import { container } from '../../../../loaders/container';
import { clearSignatureCookies } from '../../../../utils/auth/signatureCookies';

// Revokes every token the user holds, on every device, and drops this browser's cookies. The
// client forgets its claims.
const logout: RequestHandler = async (req, res) => {
    await container.userService.revokeSessions(req.user!.id);

    clearSignatureCookies(res);
    res.status(204).end();
};

export default logout;
