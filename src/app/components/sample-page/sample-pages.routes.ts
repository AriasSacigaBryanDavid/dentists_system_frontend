import { Routes } from "@angular/router";

export const samplePages: Routes = [
  {
    path: "",
    loadComponent: () => import("./sample-page").then((m) => m.SamplePage),
    data: {
      title: "Sample-page",
      breadcrumb: "Sample-page",
    },
  },
];
