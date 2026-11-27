import type { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'zaps' },
    {
        path: 'login',
        title: 'Sign in · sredio',
        loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage)
    },
    {
        path: 'login/callback',
        title: 'Signing in · sredio',
        loadComponent: () =>
            import('./features/login/login-callback.page').then((m) => m.LoginCallbackPage)
    },
    {
        path: 'zaps',
        title: 'Zaps · sredio',
        loadComponent: () => import('./features/zaps/zap-list.page').then((m) => m.ZapListPage)
    },
    { path: '**', redirectTo: 'zaps' }
];
