import { Component, input, ChangeDetectionStrategy } from "@angular/core";

import feather from "feather-icons";

@Component({
  selector: "app-feather-icon",
  imports: [],
  templateUrl: "./feather-icon.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./feather-icon.scss",
})
export class FeatherIcon {
  public readonly icon = input<string>();
  readonly class = input<string>();

  constructor() {}

  ngAfterViewInit() {
    feather.replace();
  }
}
