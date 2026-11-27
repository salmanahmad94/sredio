import { events } from '../../declarations';
import { container } from '../../loaders/container';
import type { LoginEvent } from '../../services/broadcast';

export default () => {
    container.events.on(events.auth.LOGIN, async ({ userId }: LoginEvent) => {
        try {
            await container.userService.touchLastLogin(userId);
        } catch (error) {
            container.logger.warn(`Couldn't update lastLogin: ${(error as Error).message}`, {
                label: 'SUBSCRIBER'
            });
        }
    });
};
