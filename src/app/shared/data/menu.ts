import { BehaviorSubject } from "rxjs";

import { IMenu } from "../interface/menu";

export const menuItems: IMenu[] = [
  {
    main_title: "General",
  },
  {
    title: "Sample Pages",
    icon: "home",
    type: "sub",
    active: true,
    level: 1,
    children: [
      { path: "/dashboard", title: "Sample-page1", type: "link" },
      { path: "/pages/sample-page2", title: "Sample-page2", type: "link" },
    ],
  },
  {
    title: "Clientes",
    icon: "support-tickets",
    type: "link",
    bookmark: true,
    path: "/customers",
    level: 1,
  },
  {
    title: "Usuarios",
    icon: "user",
    type: "link",
    bookmark: true,
    path: "/users",
    level: 1,
  },
  {
    title: "Citas",
    icon: "calendar",
    type: "link",
    bookmark: true,
    path: "/reservations",
    level: 1,
  },
];

// Array
export const items = new BehaviorSubject<IMenu[]>(menuItems);
