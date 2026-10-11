import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// COMPONENTS
import { CustomPagination } from '@app/components/custom-pagination';
import { EmptyTableComponent } from '@/app/shared/components/empy-table/empty-table';
import { UserModalComponent } from '../../components/user-modal/user-modal';
import { FeatherIcon } from '@/app/shared/components/ui/feather-icon/feather-icon';

// MODELS
import { UserModel, USER_ROLE_LABELS, USER_TURN_LABELS } from '../../models';

// SERVICES
import { AlertsService } from '@core/services/alerts.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-list',
  imports: [
    FormsModule,
    CustomPagination,
    EmptyTableComponent,
    UserModalComponent,
    FeatherIcon
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class UsersListComponent implements OnInit, OnDestroy {

  // INJECTS
  private alertsService = inject(AlertsService);
  private usersService = inject(UsersService);

  // UI States
  public searchTerm: string = '';
  public filterStatus: number = 1;
  public itemsPerPage: number = 7;
  public currentPage: number = 1;
  public totalItems: number = 0;
  public dataList: UserModel[] = [];
  public isButtonClicked: boolean = false;

  // Search
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription?: Subscription;

  // Signals for the Modal
  public isModalOpen = signal(false);
  public selectedUserUuid = signal<string | null>(null);

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
    const fields = ['uuid', 'username', 'first_name', 'last_name', 'email', 'role', 'turn', 'status'];
    this.usersService.getFilteredPaginatedItems(
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

  getRoleLabel(role: string): string {
    return USER_ROLE_LABELS[role] || role || 'Sin rol';
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case '00': // Admin
        return 'bg-danger-subtle text-danger';
      case '02': // Doctor
        return 'bg-primary-subtle text-primary';
      case '03': // Recepcionista
        return 'bg-info-subtle text-info';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  getTurnLabel(turn: string): string {
    return USER_TURN_LABELS[turn] || turn || 'Sin turno';
  }

  // --- MODAL --- //

  openModal(uuid: string | null = null): void {
    this.selectedUserUuid.set(uuid);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedUserUuid.set(null);
  }

  // --- ACTIONS WITH SWEETALERT --- //

  showDelete(uuid: string): void {
    if (this.isButtonClicked || !uuid) return;
    this.alertsService.alertConfirm(
      '¡Eliminar registro!',
      '¿Está seguro de que desea enviar este usuario a la papelera?',
      'Sí, eliminar'
    ).then((result: any) => {
      if (result.isConfirmed && !this.isButtonClicked) {
        this.isButtonClicked = true;
        this.usersService.deleteItem(uuid).subscribe({
          next: () => {
            this.alertsService.alertSuccess('¡Eliminado!', 'El usuario fue enviado a la papelera.');
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
      '¿Está seguro de que desea restaurar este usuario?',
      'Sí, restaurar'
    ).then((result: any) => {
      if (result.isConfirmed && !this.isButtonClicked) {
        this.isButtonClicked = true;
        this.usersService.restoreItem(uuid).subscribe({
          next: () => {
            this.alertsService.alertSuccess('¡Restaurado!', 'El usuario fue restaurado exitosamente.');
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
