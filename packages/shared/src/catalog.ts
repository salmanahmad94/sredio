/**
 * The app catalog: every developer tool the builder can show, with the triggers and actions
 * each one offers. Both the API (validation, execution) and the web app (picker, editor) read
 * from here so the two can never disagree about what exists.
 *
 * Apps marked `coming_soon` can be listed but not selected; only `available` apps run.
 */

export type AppStatus = 'available' | 'coming_soon';

export type FieldType = 'repository' | 'template' | 'text';

export interface InputField {
    key: string;
    label: string;
    type: FieldType;
    required: boolean;
    help?: string;
    placeholder?: string;
    default?: string;
}

/** A value a trigger produces that actions can reference with `{{path}}` in templates. */
export interface OutputField {
    path: string;
    label: string;
    sample: string;
}

export interface TriggerDefinition {
    key: string;
    name: string;
    description: string;
    fields: InputField[];
    outputs: OutputField[];
}

export interface ActionDefinition {
    key: string;
    name: string;
    description: string;
    fields: InputField[];
}

export interface AppDefinition {
    key: string;
    name: string;
    description: string;
    status: AppStatus;
    triggers: TriggerDefinition[];
    actions: ActionDefinition[];
}

// Apps that aren't wired up yet: listed so the picker reflects a real product, but they can't be
// selected, so they only need names.
const comingSoon = (
    key: string,
    name: string,
    description: string,
    triggers: [key: string, name: string][],
    actions: [key: string, name: string][]
): AppDefinition => ({
    key,
    name,
    description,
    status: 'coming_soon',
    triggers: triggers.map(([key, name]) => ({
        key,
        name,
        description: '',
        fields: [],
        outputs: []
    })),
    actions: actions.map(([key, name]) => ({ key, name, description: '', fields: [] }))
});

const pullRequestOutputs: OutputField[] = [
    { path: 'pull_request.number', label: 'PR number', sample: '42' },
    { path: 'pull_request.title', label: 'PR title', sample: 'Add retry to webhook handler' },
    { path: 'pull_request.user.login', label: 'PR author', sample: 'octocat' },
    {
        path: 'pull_request.html_url',
        label: 'PR URL',
        sample: 'https://github.com/octocat/hello-world/pull/42'
    },
    { path: 'pull_request.head.ref', label: 'Source branch', sample: 'feat/retry' },
    { path: 'pull_request.base.ref', label: 'Target branch', sample: 'main' },
    { path: 'repository.full_name', label: 'Repository', sample: 'octocat/hello-world' }
];

export const CATALOG: AppDefinition[] = [
    {
        key: 'github',
        name: 'GitHub',
        description: 'Pull requests, issues and repositories.',
        status: 'available',
        triggers: [
            {
                key: 'pull_request_opened',
                name: 'Pull request opened',
                description: 'Runs when a pull request is opened in a repository.',
                fields: [
                    {
                        key: 'repository',
                        label: 'Repository',
                        type: 'repository',
                        required: true,
                        help: 'Repositories you can administer. A webhook is added when the Zap is turned on.'
                    }
                ],
                outputs: pullRequestOutputs
            }
        ],
        actions: [
            {
                key: 'comment_on_pull_request',
                name: 'Comment on pull request',
                description: 'Posts a comment on the pull request that triggered the Zap.',
                fields: [
                    {
                        key: 'body',
                        label: 'Comment',
                        type: 'template',
                        required: true,
                        help: 'Insert fields from the trigger with {{field}}.',
                        default:
                            'Thanks @{{pull_request.user.login}} for opening "{{pull_request.title}}"!'
                    }
                ]
            }
        ]
    },
    comingSoon(
        'gitlab',
        'GitLab',
        'Merge requests and pipelines.',
        [['merge_request_opened', 'Merge request opened']],
        [['comment_on_merge_request', 'Comment on merge request']]
    ),
    comingSoon(
        'jira',
        'Jira',
        'Issues and sprints.',
        [['issue_created', 'Issue created']],
        [['create_issue', 'Create issue']]
    ),
    comingSoon(
        'linear',
        'Linear',
        'Issues and cycles.',
        [['issue_created', 'Issue created']],
        [['create_issue', 'Create issue']]
    ),
    comingSoon(
        'slack',
        'Slack',
        'Messages and channels.',
        [],
        [['send_message', 'Send channel message']]
    ),
    comingSoon(
        'sentry',
        'Sentry',
        'Errors and releases.',
        [['issue_alert', 'New issue alert']],
        []
    ),
    comingSoon('vercel', 'Vercel', 'Deployments.', [['deployment_failed', 'Deployment failed']], [])
];

export const findApp = (appKey: string): AppDefinition | undefined =>
    CATALOG.find((app) => app.key === appKey);

export const findTrigger = (appKey: string, triggerKey: string): TriggerDefinition | undefined =>
    findApp(appKey)?.triggers.find((trigger) => trigger.key === triggerKey);

export const findAction = (appKey: string, actionKey: string): ActionDefinition | undefined =>
    findApp(appKey)?.actions.find((action) => action.key === actionKey);
