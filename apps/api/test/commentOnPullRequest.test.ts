import { describe, expect, it } from 'vitest';

import commentOnPullRequest from '../src/integrations/github/actions/commentOnPullRequest';
import { PermanentError } from '../src/integrations/types';

const payload = {
    repository: { name: 'hello', owner: { login: 'octo' } },
    pull_request: { number: 7 }
};

describe('commentOnPullRequest', () => {
    it("fails permanently when the payload has no pull request, so it isn't retried", async () => {
        const run = commentOnPullRequest.run({ token: 't', config: { body: 'Hi' }, payload: {} });

        await expect(run).rejects.toBeInstanceOf(PermanentError);
    });

    it('fails permanently when the comment is empty after filling in its fields', async () => {
        const run = commentOnPullRequest.run({
            token: 't',
            config: { body: ' {{missing.field}} ' },
            payload
        });

        await expect(run).rejects.toThrow('The comment is empty');
    });
});
