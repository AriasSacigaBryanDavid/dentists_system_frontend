import { Routes } from "@angular/router";

import { authGuard } from '@core/helpers/auth.guard';

export const content: Routes = [
  {
    path: "",
    data: {
      title: "sample-page",
      breadcrumb: "sample-page",
    },
    loadChildren: () =>
      import("../../components/pages/pages.routes").then((r) => r.pages),
  },
  {
    path: "sample-page",
    data: {
      title: "sample-page",
      breadcrumb: "sample-page",
    },
    loadChildren: () =>
      import("../../components/sample-page/sample-pages.routes").then(
        (r) => r.samplePages,
      ),
  },
  {
    path: '',
    loadChildren: () => import('../../features/customers/customers.routes').then(m => m.customersRoutes),
    canActivate: [authGuard],
  },
  {
    path: '',
    loadChildren: () => import('../../features/users/users.routes').then(m => m.usersRoutes),
    canActivate: [authGuard],
  },
  {
    path: '',
    loadChildren: () => import('../../features/reservations/reservations.routes').then(m => m.reservationsRoutes),
    canActivate: [authGuard],
  },
];
