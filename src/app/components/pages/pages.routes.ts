import { Routes } from "@angular/router";

export const pages: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./sample-page1/sample-page1").then((m) => m.SamplePage1),
        data: {
          title: "Sample-page1",
          breadcrumb: "Sample-page1",
        },
      },
      {
        path: "sample-page2",
        loadComponent: () =>
          import("./sample-page2/sample-page2").then((m) => m.SamplePage2),
        data: {
          title: "Sample-page2",
          breadcrumb: "Sample-page2",
        },
      },
    ],
  },
];
