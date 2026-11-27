import type { RequestHandler } from 'express';

import { listAdminRepositories } from '../../../../integrations/github/repositories';
import { container } from '../../../../loaders/container';

const repositories: RequestHandler = async (req, res) => {
    const token = await container.userService.getAccessToken(req.user!.id);

    res.status(200).json({ repositories: await listAdminRepositories(token) });
};

export default repositories;
