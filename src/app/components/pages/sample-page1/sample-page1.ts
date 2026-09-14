import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-sample-page1",
  standalone: true,
  imports: [],
  templateUrl: "./sample-page1.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./sample-page1.scss",
})
export class SamplePage1 {}
