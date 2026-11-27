import type { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'zaps' },
    {
        path: 'login',
        title: 'Sign in · sredio',
        loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage)
    },
    {
        path: 'zaps',
        title: 'Zaps · sredio',
        loadComponent: () => import('./features/zaps/zap-list.page').then((m) => m.ZapListPage)
    },
    { path: '**', redirectTo: 'zaps' }
];
