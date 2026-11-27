import { renderTemplate } from '@sredio/shared';

import { PermanentError, type ActionRuntime } from '../../types';
import { githubClient, githubStatus } from '../client';

interface PullRequestPayload {
    repository?: { name?: string; owner?: { login?: string } };
    pull_request?: { number?: number };
}

const commentOnPullRequest: ActionRuntime = {
    async run({ token, config, payload }) {
        const { repository, pull_request: pullRequest } = payload as PullRequestPayload;

        const owner = repository?.owner?.login;
        const repo = repository?.name;
        const issueNumber = pullRequest?.number;

        if (!owner || !repo || !issueNumber) {
            throw new PermanentError('The trigger payload has no pull request to comment on.');
        }

        const body = renderTemplate(config['body'] ?? '', payload).trim();

        if (!body) throw new PermanentError('The comment is empty after filling in its fields.');

        try {
            const { data } = await githubClient(token).issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body
            });

            return { url: data.html_url };
        } catch (error) {
            const status = githubStatus(error);

            // 4xx won't change on retry, except timeouts and rate limits.
            if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
                throw new PermanentError(
                    `GitHub refused the comment (${status}): ${(error as Error).message}`
                );
            }

            throw error;
        }
    }
};

export default commentOnPullRequest;
