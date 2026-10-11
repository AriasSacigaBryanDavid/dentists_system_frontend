import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
    {
        path: 'users',
        loadComponent: () => import('./pages/users-list/users-list').then(m => m.UsersListComponent),
        data: { title: "Usuarios" },
    },
    {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
    }
];
