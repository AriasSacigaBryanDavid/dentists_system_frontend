import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Select2Data,
  Select2Module,
  Select2UpdateEvent,
} from 'ng-select2-component';

import { country } from '../../../../data/country';

@Component({
  selector: 'app-address-modal',
  imports: [Select2Module],
  templateUrl: './address-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './address-modal.scss',
})
export class AddressModal {
  private modal = inject(NgbActiveModal);

  public country: Select2Data = country;
  public states: Select2Data = [];

  onCountryChange(event: Select2UpdateEvent) {
    const selectedCountryValue = event.value;

    const selectedCountry = this.country.find(
      (country) => 'value' in country && country.value === selectedCountryValue,
    );

    if (selectedCountry && selectedCountry.data) {
      this.states = selectedCountry?.data || [];
    }
  }

  closeModal() {
    this.modal.close();
  }
}
