/** A signed-in user, as the API returns it. */
export interface User {
    id: string;
    login: string;
    name: string | null;
    avatarUrl: string | null;
}
