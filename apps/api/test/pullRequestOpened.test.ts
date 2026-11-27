import { describe, expect, it } from 'vitest';

import pullRequestOpened from '../src/integrations/github/triggers/pullRequestOpened';

const event = (payload: object, name = 'pull_request') => ({ name, deliveryId: 'd-1', payload });
const opened = { action: 'opened', repository: { full_name: 'Octo/Hello' } };

describe('pullRequestOpened.matches', () => {
    it('matches an opened PR on the configured repository, ignoring case', () => {
        expect(pullRequestOpened.matches(event(opened), { repository: 'octo/hello' })).toBe(true);
    });

    it('ignores other actions, other events and other repositories', () => {
        const config = { repository: 'octo/hello' };

        expect(pullRequestOpened.matches(event({ ...opened, action: 'closed' }), config)).toBe(
            false
        );
        expect(pullRequestOpened.matches(event(opened, 'push'), config)).toBe(false);
        expect(pullRequestOpened.matches(event(opened), { repository: 'octo/other' })).toBe(false);
    });
});

describe('pullRequestOpened.describe', () => {
    it('summarises the PR and links to it', () => {
        const pullRequest = { number: 7, title: 'Add retries', html_url: 'https://github.com/x/7' };

        expect(pullRequestOpened.describe({ pull_request: pullRequest })).toEqual({
            summary: '#7 Add retries',
            url: 'https://github.com/x/7'
        });
    });
});
