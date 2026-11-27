import express, { Router } from 'express';

import loadZap from './middleware/loadZap';
import parseEvent from './middleware/parseEvent';
import verifySignature from './middleware/verifySignature';
import github from './responses/github';

/**
 * Incoming webhooks, mounted before the JSON body parser: the signature is computed over the
 * exact bytes GitHub sent, so the body is kept raw until it has been verified.
 */
export default (): Router => {
    const router = Router();

    router.use(express.raw({ type: 'application/json', limit: '5mb' }));

    router.post('/github/:zapId', loadZap, verifySignature, parseEvent, github);

    return router;
};
