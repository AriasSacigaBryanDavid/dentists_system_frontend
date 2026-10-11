import { DecimalPipe, NgClass } from '@angular/common';
import {
  Component,
  SimpleChanges,
  output,
  input,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbModal,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

import {
  IHasId,
  IPageSizeOptions,
  IPagination,
  ITableClickedAction,
  ITableConfigs,
} from '../../../interface/common';
import { TableService } from '../../../services/table.service';
import { Pagination } from '../pagination/pagination';
import { SvgIcon } from '../svg-icon/svg-icon';

@Component({
  selector: 'app-table',
  imports: [
    NgbPaginationModule,
    FormsModule,
    RouterModule,
    NgbDatepickerModule,
    NgbTooltipModule,
    Pagination,
    SvgIcon,
    DecimalPipe,
    NgClass,
  ],
  providers: [DecimalPipe],
  templateUrl: './table.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./table.scss'],
})
export class Table<TData extends IHasId = IHasId, TValue = unknown> {
  tableService = inject(TableService);
  private modal = inject(NgbModal);
  private calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);
  readonly tableConfig = input<ITableConfigs<TData>>();
  readonly hasCheckbox = input<boolean>();
  readonly pageSize = input<number>(4);
  readonly paginateDetails = input<boolean>(false);
  readonly showPaginate = input<boolean>(false);
  readonly tableClass = input<string>();
  readonly search = input<boolean>(true);
  readonly pagination = input<boolean>(true);
  readonly selectedRows = input<boolean>(false);
  readonly rowDetails = input<boolean>(false);
  readonly dateFilter = input<boolean>(false);
  readonly downloadReports = input<boolean>(false);
  readonly searchPlaceholder = input<string>('');

  readonly action = output<ITableClickedAction<TData, TValue>>();

  public total$: Observable<number>;
  public selected: number[] = [];
  public paginate: IPagination; // Pagination use only
  public tableRecords!: TData[];
  public pageNo: number = 1;
  public sortValue: string = '';
  public sortable_key: string;
  public searchText: string = '';
  public rowDetailOpen: boolean = false;
  public selectedOpenRows: number[] = [];
  public dateDropdownOpen: boolean = false;
  public hoveredDate: NgbDate | null = null;
  public fromDate: NgbDate | null;
  public toDate: NgbDate | null;

  public filter = {
    search: '',
    sort: '',
    page: this.pageNo,
    pageSize: this.pageSize(),
    date: {
      start_date: '',
      to_date: '',
    },
  };

  public pageSizeOptions: IPageSizeOptions[] = [
    { title: 10, value: 10 },
    { title: 15, value: 15 },
    { title: 25, value: 25 },
    { title: 50, value: 50 },
    { title: 100, value: 100 },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSize']) {
      this.filter['pageSize'] = changes['pageSize'].currentValue;

      if (
        !this.pageSizeOptions.some(
          (option) => option.value === this.filter['pageSize'],
        )
      ) {
        const index = this.pageSizeOptions.findIndex(
          (option) => option.value > this.filter['pageSize'],
        );

        const newOption = {
          title: this.filter['pageSize'],
          value: this.filter['pageSize'],
          selected: true,
        };

        if (index === -1) {
          this.pageSizeOptions.push(newOption);
        } else {
          this.pageSizeOptions.splice(index, 0, newOption);
        }
      }
    }

    if (
      changes['tableConfig'] &&
      this.tableConfig()! &&
      this.tableConfig()!.data
    ) {
      this.paginateData();
    }

    if (changes['pageNo']) {
      this.paginateData();
    }
  }

  isArray<T>(value: T): boolean {
    return Array.isArray(value);
  }

  getNestedPropertyValue(
    dataField: string | undefined,
    columnData: Record<string, unknown>,
  ): string {
    if (!dataField) return '';

    const keys = dataField.split('.');
    let value: unknown = columnData;

    for (const key of keys) {
      if (typeof value === 'object' && value !== null && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return '';
      }
    }

    return typeof value === 'string' ? value : String(value ?? '');
  }

  getColumnClass(template: string, details: Record<string, string>) {
    for (let key in details) {
      if (template.includes(key)) {
        const value = details[key];
        template = template.replace(key, value);
      }
    }
    return template;
  }

  checkUncheckAll(event: Event) {
    this.tableConfig()!.data.forEach((item: TData) => {
      item.is_checked = (event.target as HTMLInputElement)?.checked;
      this.setSelectedItem(
        (event.target as HTMLInputElement)?.checked,
        item.id!,
      );
    });
  }

  onItemChecked(event: Event) {
    this.setSelectedItem(
      (<HTMLInputElement>event.target)?.checked,
      Number((<HTMLInputElement>event.target)?.value),
    );
  }

  setSelectedItem(checked: Boolean, value: Number) {
    const index = this.selected.indexOf(Number(value));
    if (checked) {
      if (index == -1) this.selected.push(Number(value));
    } else {
      this.selected = this.selected.filter((id) => id !== Number(value));
    }
  }

  onSort(field: string) {
    this.sortable_key = field;
    this.filter['page'] = 1;
    this.filter['sort'] == 'asc'
      ? (this.filter['sort'] = 'desc')
      : this.filter['sort'] == 'desc'
        ? (this.filter['sort'] = '')
        : (this.filter['sort'] = 'asc');
    this.applyFilters();
  }

  paginateData() {
    if (this.tableConfig()! && this.tableConfig()!.data) {
      this.applyFilters();
    }
  }

  setPage(data: number) {
    this.filter['page'] = data;
    this.paginateData();
  }

  searchTerm(value: string) {
    this.filter['page'] = 1;
    this.filter['search'] = value;
    this.applyFilters();
  }

  handleSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.filter['pageSize'] = +selectElement.value;
    this.applyFilters();
  }

  handleAction(value: IHasId, details: TData) {
    if (value['action_to_perform'] == 'delete') {
      if (!value['modal']) {
        this.action.emit({
          action_to_perform: value['action_to_perform'],
          data: details,
        });
      } else {
        void Swal.fire({
          title: 'Are you sure?',
          text: value['model_text']
            ? value['model_text']
            : 'Do you really want to delete the product?',
          imageUrl: 'assets/images/gif/trash.gif',
          confirmButtonText: 'Yes, delete it!',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          cancelButtonColor: '#FC4438',
        }).then((result) => {
          if (result.isConfirmed) {
            this.action.emit({
              action_to_perform: value['action_to_perform'],
              data: details,
            });
          }
        });
      }
    }
    if (value['action_to_perform'] == 'view') {
      this.action.emit({
        action_to_perform: value['action_to_perform'],
        data: details,
      });
    }
  }

  openRowDetails(id: number) {
    const index = this.selectedOpenRows.indexOf(id);

    if (index === -1) {
      this.selectedOpenRows.push(id);
    } else {
      this.selectedOpenRows = this.selectedOpenRows.filter(
        (rowId) => rowId !== id,
      );
    }
  }

  getColSpan() {
    const columnLength = this.tableConfig()!.columns.length;
    const actionLength = this.tableConfig()!.row_action ? 1 : 0;
    const isCheckbox = this.hasCheckbox() ? 1 : 0;
    const isRowDetails = this.rowDetails() ? 1 : 0;

    return columnLength + actionLength + isCheckbox + isRowDetails;
  }

  public selectedDate: string = '';
  public selectedValue: string = '';

  handleDropdown() {
    this.dateDropdownOpen = !this.dateDropdownOpen;
  }

  handleDateFilter(value: string) {
    this.selectedValue = value;
    let today = new Date();
    let formattedDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    if (this.selectedValue) {
      if (this.selectedValue === 'today') {
        this.filter['date']['start_date'] = formattedDate;
        this.filter['date']['to_date'] = formattedDate;
      } else if (this.selectedValue === 'yesterday') {
        let yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        formattedDate =
          yesterday.getFullYear() +
          '-' +
          String(yesterday.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(yesterday.getDate()).padStart(2, '0');
        this.filter['date']['start_date'] = formattedDate;
        this.filter['date']['to_date'] = formattedDate;
      } else if (this.selectedValue === '7_days') {
        let sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        formattedDate =
          sevenDaysAgo.getFullYear() +
          '-' +
          String(sevenDaysAgo.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(sevenDaysAgo.getDate()).padStart(2, '0');
        this.filter['date']['start_date'] = formattedDate;
        this.filter['date']['to_date'] =
          today.getFullYear() +
          '-' +
          String(today.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(today.getDate()).padStart(2, '0');
      } else if (this.selectedValue === '30_days') {
        let thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        formattedDate =
          thirtyDaysAgo.getFullYear() +
          '-' +
          String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(thirtyDaysAgo.getDate()).padStart(2, '0');
        this.filter['date']['start_date'] = formattedDate;
        this.filter['date']['to_date'] =
          today.getFullYear() +
          '-' +
          String(today.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(today.getDate()).padStart(2, '0');
      } else if (this.selectedValue === 'this_month') {
        let startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        let endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month

        let formattedStartDate =
          startOfMonth.getFullYear() +
          '-' +
          String(startOfMonth.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(startOfMonth.getDate()).padStart(2, '0');

        let formattedEndDate =
          endOfMonth.getFullYear() +
          '-' +
          String(endOfMonth.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(endOfMonth.getDate()).padStart(2, '0');

        this.filter['date']['start_date'] = formattedStartDate;
        this.filter['date']['to_date'] = formattedEndDate; // Last day of the month
      } else if (this.selectedValue === 'last_month') {
        let firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        let lastDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0,
        );
        formattedDate =
          firstDayLastMonth.getFullYear() +
          '-' +
          String(firstDayLastMonth.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(firstDayLastMonth.getDate()).padStart(2, '0');
        this.filter['date']['start_date'] = formattedDate;
        formattedDate =
          lastDayLastMonth.getFullYear() +
          '-' +
          String(lastDayLastMonth.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(lastDayLastMonth.getDate()).padStart(2, '0');
        this.filter['date']['to_date'] = formattedDate;
      }
    }

    this.selectedDate = `${this.filter['date']['start_date']} - ${this.filter['date']['to_date']}`;
    this.dateDropdownOpen = false;
    this.applyFilters();
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate || (this.fromDate && this.toDate)) {
      this.fromDate = date;
      this.toDate = null;
    } else if (this.fromDate && !this.toDate) {
      if (date.after(this.fromDate)) {
        this.toDate = date;
        this.filter['date']['start_date'] =
          `${this.fromDate.year}-${String(this.fromDate.month).padStart(2, '0')}-${String(this.fromDate.day).padStart(2, '0')}`;
        this.filter['date']['to_date'] =
          `${this.toDate.year}-${String(this.toDate.month).padStart(2, '0')}-${String(this.toDate.day).padStart(2, '0')}`;
        this.selectedDate = `${this.filter['date']['start_date']} - ${this.filter['date']['to_date']}`;
      } else {
        this.fromDate = date;
      }
    }

    if (this.fromDate && this.toDate) {
      this.selectedValue = '';
    }

    this.applyFilters();
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  applyFilters() {
    let filteredData = [...this.tableConfig()!.data];

    // Search filter
    const searchTerm = this.filter['search']?.trim()?.toLowerCase() ?? '';
    if (searchTerm !== '') {
      filteredData = filteredData.filter((item: TData) => {
        return Object.keys(item).some((key: string) => {
          const value = item[key as keyof TData];

          if (typeof value === 'string' || typeof value === 'object') {
            const valueString = String(value).toLowerCase();
            return valueString.toLowerCase().includes(searchTerm);
          }

          if (typeof value === 'number') {
            return value.toString().includes(searchTerm);
          }

          return false;
        });
      });
    }

    // Sorting filter
    const sortKey = this.sortable_key as keyof TData;
    if (this.filter['sort'] && sortKey) {
      filteredData.sort((a: TData, b: TData): number => {
        const valueA = a[sortKey];
        const valueB = b[sortKey];

        const getTextContent = (value: unknown): string => {
          if (typeof value === 'string') return value;
          if (typeof value === 'object' && value !== null) {
            const div = document.createElement('div');
            div.innerHTML = value.toString?.() ?? '';
            return div.textContent ?? div.innerText ?? '';
          }
          return '';
        };

        const textA = getTextContent(valueA);
        const textB = getTextContent(valueB);

        if (
          (typeof valueA === 'string' || typeof valueA === 'object') &&
          (typeof valueB === 'string' || typeof valueB === 'object')
        ) {
          return this.filter['sort'] === 'asc'
            ? textA.localeCompare(textB)
            : textB.localeCompare(textA);
        }

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return this.filter['sort'] === 'asc'
            ? valueA - valueB
            : valueB - valueA;
        }

        return 0;
      });
    }

    // Date range filter
    const startDateStr = this.filter['date']?.['start_date'];
    if (startDateStr) {
      const fromDate = new Date(startDateStr);
      const toDate = this.filter['date']['to_date']
        ? new Date(this.filter['date']['to_date'])
        : null;

      filteredData = filteredData.filter((data: TData) => {
        const recordDateRaw = data.date;

        if (recordDateRaw) {
          const recordDate = new Date(recordDateRaw);
          if (fromDate && toDate)
            return recordDate >= fromDate && recordDate <= toDate;
          if (fromDate) return recordDate >= fromDate;
          if (toDate) return recordDate <= toDate;
        }

        return true;
      });
    }

    // Pagination
    this.paginate = this.tableService.getPager(
      filteredData.length,
      this.filter['page'],
      this.filter['pageSize'],
    );
    this.tableRecords = filteredData.slice(
      this.paginate.start_index,
      this.paginate.end_index + 1,
    );
  }
}
