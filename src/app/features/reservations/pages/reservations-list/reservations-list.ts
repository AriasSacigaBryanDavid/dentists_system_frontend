import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// COMPONENTS
import { CustomPagination } from '@app/components/custom-pagination';
import { EmptyTableComponent } from '@/app/shared/components/empy-table/empty-table';
import { ReservationModalComponent } from '../../components/reservation-modal/reservation-modal';
import { FeatherIcon } from '@/app/shared/components/ui/feather-icon/feather-icon';

// MODELS
import { ReservationModel, ReservationState, RESERVATION_STATE_LABELS, RESERVATION_STATE_BADGES } from '../../models';

// SERVICES
import { AlertsService } from '@core/services/alerts.service';
import { ReservationsService } from '../../services/reservations.service';

@Component({
  selector: 'app-reservations-list',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    CustomPagination,
    EmptyTableComponent,
    ReservationModalComponent,
    FeatherIcon
  ],
  templateUrl: './reservations-list.html',
  styleUrl: './reservations-list.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class ReservationsListComponent implements OnInit, OnDestroy {

  // INJECTS
  private alertsService = inject(AlertsService);
  private reservationsService = inject(ReservationsService);

  // UI States
  public searchTerm: string = '';
  public filterStatus: number = 1;
  public itemsPerPage: number = 7;
  public currentPage: number = 1;
  public totalItems: number = 0;
  public dataList: ReservationModel[] = [];
  public isButtonClicked: boolean = false;

  // Search pipeline
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription?: Subscription;

  // Signals for the Modal
  public isModalOpen = signal(false);
  public selectedReservationUuid = signal<string | null>(null);

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
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((term: string) => {
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
    const fields = [
      'uuid',
      'customer',
      'customer_name',
      'doctor',
      'doctor_name',
      'date_time',
      'states',
      'state_display',
      'observation',
      'status'
    ];

    this.reservationsService.getFilteredPaginatedItems(
      this.currentPage,
      this.itemsPerPage,
      this.filterStatus.toString(),
      filters,
      fields
    ).subscribe({
      next: (resp: any) => {
        this.totalItems = resp.count;
        this.dataList = resp.results;
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

  // --- LABELS & BADGES --- //

  getStateLabel(item: ReservationModel): string {
    return item.state_display || RESERVATION_STATE_LABELS[item.states] || 'Desconocido';
  }

  getStateBadgeClass(state: number): string {
    return RESERVATION_STATE_BADGES[state] || 'bg-secondary-subtle text-secondary';
  }

  // --- MODAL --- //

  openModal(uuid: string | null = null): void {
    this.selectedReservationUuid.set(uuid);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedReservationUuid.set(null);
  }

  // --- ACTIONS WITH SWEETALERT --- //

  showDelete(uuid: string): void {
    if (this.isButtonClicked || !uuid) return;
    this.alertsService.alertConfirm(
      '¡Eliminar registro!',
      '¿Está seguro de que desea enviar esta cita a la papelera?',
      'Sí, eliminar'
    ).then((result: any) => {
      if (result.isConfirmed && !this.isButtonClicked) {
        this.isButtonClicked = true;
        this.reservationsService.deleteItem(uuid).subscribe({
          next: () => {
            this.alertsService.alertSuccess('¡Eliminado!', 'La cita fue enviada a la papelera.');
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
      '¿Está seguro de que desea restaurar esta cita?',
      'Sí, restaurar'
    ).then((result: any) => {
      if (result.isConfirmed && !this.isButtonClicked) {
        this.isButtonClicked = true;
        this.reservationsService.restoreItem(uuid).subscribe({
          next: () => {
            this.alertsService.alertSuccess('¡Restaurado!', 'La cita fue restaurada exitosamente.');
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
