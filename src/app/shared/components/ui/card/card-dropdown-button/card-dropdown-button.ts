import { NgClass } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { ICardToggleOptions } from '../../../../interface/common';

@Component({
  selector: 'app-card-dropdown-button',
  imports: [NgbDropdownModule, NgClass],
  templateUrl: './card-dropdown-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './card-dropdown-button.scss',
})
export class CardDropdownButton {
  readonly dropdownType = input<string>();
  readonly options = input<ICardToggleOptions[]>();
  readonly dropdownClass = input<string>();

  public show: boolean = false;
  public selectedItem: string;

  ngOnChanges() {
    this.selectedItem = this.options()?.[0]?.title ?? '';
  }

  selectItem(value: string) {
    this.selectedItem = value;
    this.show = false;
  }
}
