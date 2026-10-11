import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// SERVICES
import { UsersService } from '../../services/users.service';
import { AlertsService } from '@core/services/alerts.service';
import { UserRole, UserTurn } from '../../models';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss'
})
export class UserModalComponent implements OnInit {

  @Input() userUuid: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshTable = new EventEmitter<void>();

  // INJECTS
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private alertsService = inject(AlertsService);

  // UI States
  public userForm!: FormGroup;
  public loading = false;

  public roleOptions = [
    { value: UserRole.ADMIN, label: 'Admin' },
    { value: UserRole.DOCTOR, label: 'Doctor' },
    { value: UserRole.RECEPTIONIST, label: 'Recepcionista' }
  ];

  public turnOptions = [
    { value: UserTurn.MORNING, label: 'Mañana' },
    { value: UserTurn.AFTERNOON, label: 'Tarde' }
  ];

  ngOnInit(): void {
    this.initForm();
    if (this.userUuid) {
      this.loadUserData();
    }
  }

  get formControls() {
    return this.userForm.controls;
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150)
      ]],
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.email
      ]],
      role: [UserRole.RECEPTIONIST, [
        Validators.required
      ]],
      turn: [UserTurn.MORNING, [
        Validators.required
      ]],
      password: ['', this.userUuid ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]]
    });
  }

  // --- GET DATA --- //

  loadUserData(): void {
    this.loading = true;
    const fields = ['uuid', 'username', 'first_name', 'last_name', 'email', 'role', 'turn'];

    this.usersService.getItem(this.userUuid!, fields).subscribe({
      next: (data: any) => {
        this.userForm.patchValue({
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || '',
          role: data.role || UserRole.RECEPTIONIST,
          turn: data.turn || UserTurn.MORNING
        });
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
        this.userForm.get('password')?.updateValueAndValidity();

        this.loading = false;
      },
      error: () => {
        this.alertsService.alertError('Error', 'No se pudo cargar la información del usuario.');
        this.close();
      }
    });
  }

  // --- ACTIONS --- //

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.saveData();
  }

  saveData(): void {
    this.loading = true;

    const payload: any = { ...this.userForm.value };

    if (this.userUuid && !payload.password) {
      delete payload.password;
    }

    const request$ = this.userUuid
      ? this.usersService.updateItem(this.userUuid, payload)
      : this.usersService.createItem(payload);

    request$.subscribe({
      next: () => {
        this.alertsService.alertSuccess('¡Éxito!', 'Usuario guardado correctamente.');
        this.refreshTable.emit();
        this.close();
      },
      error: (err: any) => {
        console.error(err);
        this.alertsService.alertError('Error', 'Ocurrió un problema al guardar el usuario.');
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}
