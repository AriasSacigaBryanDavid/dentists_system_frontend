import { Component, ChangeDetectionStrategy } from "@angular/core";

import { SamplePage1 } from "../pages/sample-page1/sample-page1";

@Component({
  selector: "app-sample-page",
  standalone: true,
  imports: [SamplePage1],
  templateUrl: "./sample-page.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./sample-page.scss",
})
export class SamplePage {}
