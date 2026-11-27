import type { UserDocument } from '../models/user';
import type { TriggerEvent } from '../integrations/types';
import type { ZapDocument } from '../models/zap';

declare global {
    namespace Express {
        // What passport puts on req.user.
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface User extends UserDocument {}

        // Values middleware hands to the next step in the request lifecycle.
        interface Locals {
            user?: UserDocument;
            zap?: ZapDocument;
            event?: TriggerEvent;
        }
    }
}

export {};
