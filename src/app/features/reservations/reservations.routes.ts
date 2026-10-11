import { Routes } from '@angular/router';

export const reservationsRoutes: Routes = [
    {
        path: 'reservations',
        loadComponent: () => import('./pages/reservations-list/reservations-list').then(m => m.ReservationsListComponent),
        data: { title: "Citas" },
    },
    {
        path: '',
        redirectTo: 'reservations',
        pathMatch: 'full'
    }
];
