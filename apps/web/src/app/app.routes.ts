import type { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'zaps' },
    {
        path: 'login',
        canActivate: [guestGuard],
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
        canActivate: [authGuard],
        title: 'Zaps · sredio',
        loadComponent: () => import('./features/zaps/zap-list.page').then((m) => m.ZapListPage)
    },
    {
        path: 'zaps/new',
        canActivate: [authGuard],
        title: 'New Zap · sredio',
        loadComponent: () => import('./features/zaps/zap-editor.page').then((m) => m.ZapEditorPage)
    },
    {
        path: 'zaps/:id',
        canActivate: [authGuard],
        title: 'Edit Zap · sredio',
        loadComponent: () => import('./features/zaps/zap-editor.page').then((m) => m.ZapEditorPage)
    },
    { path: '**', redirectTo: 'zaps' }
];
