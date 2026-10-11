import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

//SERVICES
import { CustomersService } from '../../services/customers.service';
import { AlertsService } from '@core/services/alerts.service';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-modal.html',
  styleUrl: './customer-modal.scss'
})
export class CustomerModalComponent implements OnInit {

  @Input() customerUuid: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshTable = new EventEmitter<void>();

  // INJECTS
  private fb = inject(FormBuilder);
  private customersService = inject(CustomersService);
  private alertsService = inject(AlertsService);

  // UI States
  public customerForm!: FormGroup;
  public loading = false;

  ngOnInit(): void {
    this.initForm();
    if (this.customerUuid) {
      this.loadCustomerData();
    }
  }

  get formControls() {
    return this.customerForm.controls;
  }

  initForm(): void {
    this.customerForm = this.fb.group({
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
      address: ['', [
        Validators.maxLength(255)
      ]],
      phone: ['', [
        Validators.maxLength(20),
        Validators.pattern(/^[0-9+()\- ]*$/)
      ]],
      age: [null, [
        Validators.min(0),
        Validators.max(120),
        Validators.pattern(/^[0-9]*$/)
      ]]
    });
  }

  // --- GET DATA --- //

  loadCustomerData(): void {
    this.loading = true;
    const fields = ['uuid', 'first_name', 'last_name', 'address', 'phone', 'age'];

    this.customersService.getItem(this.customerUuid!, fields).subscribe({
      next: (data: any) => {
        this.customerForm.patchValue({
          first_name: data.first_name,
          last_name: data.last_name,
          address: data.address || '',
          phone: data.phone || '',
          age: data.age ?? null
        });
        this.loading = false;
      },
      error: () => {
        this.alertsService.alertError('Error', 'No se pudo cargar la información.');
        this.close();
      }
    });
  }

  // --- ACTIONS --- //

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    this.saveData();
  }

  saveData(): void {
    this.loading = true;

    const payload = { ...this.customerForm.value };

    const request$ = this.customerUuid
      ? this.customersService.updateItem(this.customerUuid, payload)
      : this.customersService.createItem(payload);

    request$.subscribe({
      next: () => {
        this.alertsService.alertSuccess('¡Éxito!', 'Cliente guardado correctamente.');
        this.refreshTable.emit();
        this.close();
      },
      error: (err) => {
        console.error(err);
        this.alertsService.alertError('Error', 'Ocurrió un problema al guardar.');
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}