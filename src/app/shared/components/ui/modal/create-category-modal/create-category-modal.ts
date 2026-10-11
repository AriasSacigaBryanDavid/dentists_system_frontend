import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Select2Data, Select2Module } from 'ng-select2-component';

import { category, categoryStatus } from '../../../../data/category';
import { ICategory } from '../../../../interface/category';

@Component({
  selector: 'app-create-category-modal',
  imports: [AngularEditorModule, Select2Module],
  templateUrl: './create-category-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './create-category-modal.scss',
})
export class CreateCategoryModal {
  private modal = inject(NgbActiveModal);

  public category: ICategory[] = category;
  public categoryStatus = categoryStatus;
  public parentCategory: Select2Data = [];
  public categoryType: Select2Data = [];

  constructor() {
    this.category.filter((category) => {
      this.parentCategory.push({
        value: category.category_name,
        label: category.category_name,
      });
      this.categoryType.push({
        value: category.category_type,
        label: category.category_type,
      });
    });
  }

  close() {
    this.modal.close();
  }
}
