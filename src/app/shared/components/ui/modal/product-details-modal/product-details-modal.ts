import {
  Component,
  inject,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IProduct } from '../../../../interface/product';

@Component({
  selector: 'app-product-details-modal',
  imports: [RouterModule],
  templateUrl: './product-details-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-details-modal.scss',
})
export class ProductDetailsModal {
  private modal = inject(NgbActiveModal);

  @Input() productDetail: IProduct;

  public counter: number = 1;

  changeValue(value: number) {
    if (value == -1) {
      if (this.counter > 1) {
        this.counter -= 1;
      }
    } else if (value == 1) {
      this.counter += 1;
    }
  }

  closeModal() {
    this.modal.close();
  }
}
