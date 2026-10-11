import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-label-modal',
  imports: [],
  templateUrl: './add-label-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-label-modal.scss',
})
export class AddLabelModal {
  private modal = inject(NgbActiveModal);

  closeModal() {
    this.modal.close();
  }
}
