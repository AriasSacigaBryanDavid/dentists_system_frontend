import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

// SERVICES
import { ReservationsService } from '../../services/reservations.service';
import { CustomersService } from '@/app/features/customers/services/customers.service';
import { UsersService } from '@/app/features/users/services/users.service';
import { AlertsService } from '@core/services/alerts.service';

// MODELS
import { ReservationState, RESERVATION_STATE_LABELS } from '../../models';
import { CustomerModel } from '@/app/features/customers/models';
import { UserModel } from '@/app/features/users/models';

@Component({
  selector: 'app-reservation-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reservation-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './reservation-modal.scss'
})
export class ReservationModalComponent implements OnInit {

  @Input() reservationUuid: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshTable = new EventEmitter<void>();

  // INJECTS
  private fb = inject(FormBuilder);
  private reservationsService = inject(ReservationsService);
  private customersService = inject(CustomersService);
  private usersService = inject(UsersService);
  private alertsService = inject(AlertsService);

  // UI States
  public reservationForm!: FormGroup;
  public loading = false;
  public loadingSelects = false;

  // Options for selects
  public customersList: CustomerModel[] = [];
  public doctorsList: UserModel[] = [];

  public stateOptions = [
    { value: ReservationState.PENDING, label: 'Pendiente' },
    { value: ReservationState.CONFIRMED, label: 'Confirmada' },
    { value: ReservationState.COMPLETED, label: 'Completada' },
    { value: ReservationState.CANCELED, label: 'Cancelada' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadSelectData();
  }

  get formControls() {
    return this.reservationForm.controls;
  }

  initForm(): void {
    this.reservationForm = this.fb.group({
      customer: ['', [Validators.required]],
      doctor: ['', [Validators.required]],
      date_time: ['', [Validators.required]],
      states: [ReservationState.PENDING, [Validators.required]],
      observation: ['']
    });
  }

  // --- GET DATA --- //

  loadSelectData(): void {
    this.loadingSelects = true;

    forkJoin({
      customers: this.customersService.getItems(['uuid', 'full_name', 'first_name', 'last_name']),
      users: this.usersService.getItems(['uuid', 'full_name', 'first_name', 'last_name', 'role'], 'doctors')
    }).subscribe({
      next: ({ customers, users }: any) => {
        this.customersList = customers || [];
        this.doctorsList = users || [];
        this.loadingSelects = false;

        if (this.reservationUuid) {
          this.loadReservationData();
        }
      },
      error: (err: any) => {
        console.error(err);
        this.loadingSelects = false;
        this.alertsService.toastError('No se pudieron cargar clientes o doctores.', 'Error');
        if (this.reservationUuid) {
          this.loadReservationData();
        }
      }
    });
  }

  loadReservationData(): void {
    this.loading = true;
    const fields = ['uuid', 'customer', 'doctor', 'date_time', 'states', 'observation'];

    this.reservationsService.getItem(this.reservationUuid!, fields).subscribe({
      next: (data: any) => {
        this.reservationForm.patchValue({
          customer: data.customer?.uuid || data.customer,
          doctor: data.doctor?.uuid || data.doctor,
          date_time: this.formatForDateTimeLocal(data.date_time),
          states: Number(data.states),
          observation: data.observation || ''
        });
        this.loading = false;
      },
      error: () => {
        this.alertsService.alertError('Error', 'No se pudo cargar la información de la cita.');
        this.close();
      }
    });
  }

  private formatForDateTimeLocal(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 16);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // --- ACTIONS --- //

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }
    this.saveData();
  }

  saveData(): void {
    this.loading = true;

    const payload = { ...this.reservationForm.value };

    const request$ = this.reservationUuid
      ? this.reservationsService.updateItem(this.reservationUuid, payload)
      : this.reservationsService.createItem(payload);

    request$.subscribe({
      next: () => {
        this.alertsService.alertSuccess('¡Éxito!', 'Cita guardada correctamente.');
        this.refreshTable.emit();
        this.close();
      },
      error: (err: any) => {
        console.error(err);
        this.alertsService.alertError('Error', 'Ocurrió un problema al guardar la cita.');
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}
