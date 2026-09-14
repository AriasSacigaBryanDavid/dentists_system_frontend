import { Routes } from '@angular/router';

export const authRoutes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
        data: { title: "Iniciar Sesión" },
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];