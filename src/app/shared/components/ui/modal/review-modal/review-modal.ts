import { NgClass } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  NgbActiveModal,
  NgbRatingConfig,
  NgbRatingModule,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-review-modal',
  imports: [NgbRatingModule, ReactiveFormsModule, NgClass],
  templateUrl: './review-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './review-modal.scss',
})
export class ReviewModal {
  private config = inject(NgbRatingConfig);
  private modal = inject(NgbActiveModal);

  public rating = 4;
  public reviewForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    rating: new FormControl(this.rating ? this.rating : 0),
  });

  constructor() {
    this.config.max = 5;
    this.config.readonly = false;
  }

  submit() {
    this.reviewForm.markAllAsTouched();

    if (this.reviewForm.valid) {
      this.modal.close();
    }
  }

  closeModal() {
    this.modal.close();
  }
}
