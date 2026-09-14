import { Routes } from "@angular/router";

import { content } from "./shared/routes/content.routes";
import { authGuard } from '@core/helpers/auth.guard';

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  {
    path: "",
    loadComponent: () =>
      import("./shared/components/layout/content/content").then(
        (m) => m.Content,
      ),
    children: content,
    canActivate: [authGuard],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
