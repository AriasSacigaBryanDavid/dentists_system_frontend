import { Routes } from '@angular/router';

export const customersRoutes: Routes = [
    {
        path: 'customers',
        loadComponent: () => import('./pages/customers-list/customers-list').then(m => m.CustomersListComponent),
        data: { title: "Clientes" },
    },
    {
        path: '',
        redirectTo: 'customers',
        pathMatch: 'full'
    }
];