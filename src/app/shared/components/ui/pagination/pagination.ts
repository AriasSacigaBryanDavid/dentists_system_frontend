import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';

import { IPagination } from '../../../interface/common';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pagination.scss',
})
export class Pagination {
  public readonly total = input<number>();
  public readonly currentPage = input<number>();
  public readonly pageSize = input<number>();
  readonly paginate = input<IPagination>();
  readonly paginateDetails = input<boolean>();
  readonly selectedItems = input<number>();
  readonly selectedRows = input<boolean>();
  readonly setPage = output<number>();

  // Set Page
  pageSet(page: number) {
    this.setPage.emit(page); // Set Page Number
  }
}
