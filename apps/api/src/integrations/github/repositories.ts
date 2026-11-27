import type { Repository } from '@sredio/shared';

import { githubClient, githubStatus, signInAgainError } from './client';

const MAX_REPOSITORIES = 500;

/** Repositories the user can add webhooks to (admin access), most recently updated first. */
export const listAdminRepositories = async (token: string): Promise<Repository[]> => {
    const octokit = githubClient(token);
    const repositories: Repository[] = [];

    try {
        for await (const { data } of octokit.paginate.iterator(
            octokit.repos.listForAuthenticatedUser,
            { per_page: 100, sort: 'updated' }
        )) {
            for (const repository of data) {
                if (repository.permissions?.admin) {
                    repositories.push({
                        fullName: repository.full_name,
                        private: repository.private
                    });
                }
            }

            if (repositories.length >= MAX_REPOSITORIES) break;
        }
    } catch (error) {
        if (githubStatus(error) === 401) throw signInAgainError();
        throw error;
    }

    return repositories;
};
