import { Component, ChangeDetectionStrategy } from '@angular/core';

import { LayoutCustomizer } from './layout-customizer/layout-customizer';
import { SettingCustomizer } from './setting-customizer/setting-customizer';

@Component({
  selector: 'app-customizer',
  imports: [SettingCustomizer, LayoutCustomizer],
  templateUrl: './customizer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './customizer.scss',
})
export class Customizer {
  public customizer: { layout: boolean; setting: boolean } = {
    layout: false,
    setting: false,
  };

  open(value: keyof typeof this.customizer) {
    this.customizer[value] = true;
  }

  openLayout() {
    this.customizer.layout = true;
  }

  handleCustomizer(value: boolean) {
    this.customizer.setting = value;
  }

  handleLayout(value: boolean) {
    this.customizer.layout = value;
  }
}
