import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

//COMPONENTS
import { CustomPagination } from '@app/components/custom-pagination';
import { EmptyTableComponent } from '@/app/shared/components/empy-table/empty-table';
import { CustomerModalComponent } from '../../components/customer-modal/customer-modal';
import { FeatherIcon } from '@/app/shared/components/ui/feather-icon/feather-icon';

//MODELS
import { CustomerModel } from '../../models';

//SERVICES
import { AlertsService } from '@core/services/alerts.service';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-customers-list',
  imports: [
    FormsModule,
    CustomPagination,
    EmptyTableComponent,
    CustomerModalComponent,
    
    FeatherIcon
  ],
  templateUrl: './customers-list.html',
  styleUrl: './customers-list.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class CustomersListComponent implements OnInit, OnDestroy {

  // INJECTS
  private alertsService = inject(AlertsService);
  private customersService = inject(CustomersService);

  // UI States
  public searchTerm: string = '';
  public filterStatus: number = 1;
  public itemsPerPage: number = 7;
  public currentPage: number = 1;
  public totalItems: number = 0;
  public dataList: CustomerModel[] = [];
  public isButtonClicked: boolean = false;

  // We set up the pipeline and your subscription
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription?: Subscription;

  // Signals for the Modal
  public isModalOpen = signal(false);
  public selectedCustomerUuid = signal<string | null>(null);

  ngOnInit(): void {
    this.initSearch();
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // --- GET DATA --- //

  private initSearch(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500), // Wait 500 milliseconds after the last keystroke
      distinctUntilChanged() // Only proceed if the text has actually changed
    ).subscribe((term: string) => {
      // We require at least 2 characters, OR leave it blank to reset the list
      if (term.length >= 2 || term.length === 0) {
        this.currentPage = 1;
        this.loadData();
      }
    });
  }

  toggleStatusFilter(): void {
    this.filterStatus = this.filterStatus === 1 ? 0 : 1;
    this.currentPage = 1;
    this.loadData();
  }

  loadData(): void {
    const filters = {
      data_search: this.searchTerm,
    };
    const fields = ['uuid', 'first_name', 'last_name', 'phone', 'address', 'age', 'status'];
    this.customersService.getFilteredPaginatedItems(
      this.currentPage,
      this.itemsPerPage,
      this.filterStatus.toString(),
      filters,
      fields
    ).subscribe({
      next: (resp: any) => {
        this.totalItems = resp.count;
        this.dataList = resp.results;
        console.log(this.dataList)
      },
      error: (err: any) => {
        if (err.status === 404 && this.currentPage > 1) {
          this.currentPage--;
          this.loadData();
          return;
        }
        console.error(err);
        this.alertsService.toastError(
          'No se pudo conectar con el servidor.',
          'Error de Conexión'
        );
      }
    });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term.trim());
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  // --- MODAL --- //

  openModal(uuid: string | null = null): void {
    this.selectedCustomerUuid.set(uuid);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedCustomerUuid.set(null);
  }

  // --- ACTIONS WITH SWEETALERT --- //

  showDelete(uuid: string): void {
    if (this.isButtonClicked || !uuid) return;
    this.alertsService.alertConfirm(
      '¡Eliminar registro!',
      '¿Está seguro de que desea enviar este cliente a la papelera?',
      'Sí, eliminar'
    ).then((result: any) => {
      if (result.isConfirmed && !this.isButtonClicked) {
        this.isButtonClicked = true;
        this.customersService.deleteItem(uuid).subscribe({
          next: () => {
            this.alertsService.alertSuccess('¡Eliminado!', 'El registro fue enviado a la papelera.');
            this.loadData();
            this.isButtonClicked = false;
          },
          error: (err: any) => {
            console.error(err);
            this.alertsService.alertError('¡Error!', 'Se produjo un error al intentar eliminar el registro.');
            this.isButtonClicked = false;
          }
        });
      }
    });
  }

  showRestore(uuid: string): void {
    if (this.isButtonClicked || !uuid) return;
    this.alertsService.alertConfirm(
      '¡Restaurar registro!',
      '¿Está seguro de que desea restaurar este cliente?',
      'Sí, restaurar'
    ).then((result: any) => {
      if (result.isConfirmed && !this.isButtonClicked) {
        this.isButtonClicked = true;
        this.customersService.restoreItem(uuid).subscribe({
          next: () => {
            this.alertsService.alertSuccess('¡Restaurado!', 'El registro fue restaurado exitosamente.');
            this.filterStatus = 1;
            this.loadData();
            this.isButtonClicked = false;
          },
          error: (err: any) => {
            console.error(err);
            this.alertsService.alertError('¡Error!', 'Se produjo un error al intentar restaurar el registro.');
            this.isButtonClicked = false;
          }
        });
      }
    });
  }

}