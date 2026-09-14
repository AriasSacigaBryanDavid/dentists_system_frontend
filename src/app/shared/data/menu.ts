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
    title: "Sample-page",
    icon: "support-tickets",
    type: "link",
    bookmark: true,
    path: "/sample-page",
    level: 1,
  },
];

// Array
export const items = new BehaviorSubject<IMenu[]>(menuItems);
