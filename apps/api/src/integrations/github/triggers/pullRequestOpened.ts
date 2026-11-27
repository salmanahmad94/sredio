import HttpError from '../../../errors/HttpError';
import { randomToken } from '../../../utils/crypto';
import type { TriggerRuntime } from '../../types';
import { githubClient, githubStatus, signInAgainError, splitRepository } from '../client';

interface PullRequestPayload {
    action?: string;
    repository?: { full_name?: string };
    pull_request?: { number?: number; title?: string; html_url?: string };
}

const pullRequestOpened: TriggerRuntime = {
    async subscribe({ token, config, webhookUrl }) {
        const repository = config['repository'] ?? '';
        const secret = randomToken();

        try {
            const { data } = await githubClient(token).repos.createWebhook({
                ...splitRepository(repository),
                name: 'web',
                active: true,
                events: ['pull_request'],
                config: { url: webhookUrl, content_type: 'json', secret, insecure_ssl: '0' }
            });

            return { hookId: data.id, secret };
        } catch (error) {
            const status = githubStatus(error);

            if (status === 401) throw signInAgainError();

            if (status === 404 || status === 403) {
                throw new HttpError(
                    422,
                    `Couldn't add a webhook to ${repository}. Check that it exists and that you're an admin of it.`
                );
            }

            throw error;
        }
    },

    async unsubscribe({ token, config, hookId }) {
        try {
            await githubClient(token).repos.deleteWebhook({
                ...splitRepository(config['repository'] ?? ''),
                hook_id: hookId
            });
        } catch (error) {
            // Already gone, e.g. removed by hand on GitHub.
            if (githubStatus(error) !== 404) throw error;
        }
    },

    matches(event, config) {
        const payload = event.payload as PullRequestPayload;

        return (
            event.name === 'pull_request' &&
            payload.action === 'opened' &&
            payload.repository?.full_name?.toLowerCase() === config['repository']?.toLowerCase()
        );
    },

    describe(payload) {
        const pullRequest = (payload as PullRequestPayload).pull_request;

        return {
            summary: `#${pullRequest?.number ?? '?'} ${pullRequest?.title ?? ''}`.trim(),
            url: pullRequest?.html_url ?? null
        };
    }
};

export default pullRequestOpened;
