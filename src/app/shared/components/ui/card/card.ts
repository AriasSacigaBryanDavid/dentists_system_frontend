import { NgClass } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CardDropdownButton } from './card-dropdown-button/card-dropdown-button';
import { ICardToggleOptions } from '../../../interface/common';

@Component({
  selector: 'app-card',
  imports: [RouterModule, CardDropdownButton, NgClass],
  templateUrl: './card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './card.scss',
})
export class Card {
  readonly cardClass = input<string>();
  readonly cardBodyClass = input<string>();
  readonly headerTitle = input<string | number>();
  readonly headerTitle2 = input<string | number>();
  readonly dropdownType = input<string>();
  readonly options = input<ICardToggleOptions[]>();
  readonly padding = input<boolean>(true);
  readonly rightSideDetails = input<boolean>(false);
  readonly dropdownClass = input<string>('');
  readonly headerClass = input<string>('');
  readonly header = input<string>('');
  readonly border = input<boolean>(false);
  readonly cardType = input<string>('simple');
  readonly sortDescription = input<string>();
  readonly buttonText = input<string>();
  readonly path = input<string>();
}
