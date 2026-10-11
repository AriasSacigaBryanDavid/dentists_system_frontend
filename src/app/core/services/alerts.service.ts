import { Injectable, signal } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
export interface ToastInfo {
    header: string;
    body: string;
    type: 'danger' | 'success' | 'warning' | 'info';
    time: string;
    delay?: number;
}

@Injectable({
    providedIn: 'root',
})
export class AlertsService {

    // Signal containing the list of active toasts
    public toasts = signal<ToastInfo[]>([]);

    alertConfirm(title: string, text: string, titleButton: string): Promise<SweetAlertResult> {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: titleButton,
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            showClass: {
                popup: 'animate__animated animate__flipInX'
            },
            customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger ms-2',
            },
        });
    }

    alertSuccess(title: string, text: string): Promise<SweetAlertResult> {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            buttonsStyling: false,
            showClass: {
                popup: 'animate__animated animate__flipInX'
            },
            customClass: {
                confirmButton: 'btn btn-success',
            },
            timer: 1500
        });
    }

    alertError(title: string, text: string, timerDuration: number = 1500): Promise<SweetAlertResult> {
        const swalConfig: any = {
            icon: 'error',
            title: title,
            text: text,
            buttonsStyling: false,
            showClass: {
                popup: 'animate__animated animate__flipInX'
            },
            customClass: {
                confirmButton: 'btn btn-danger',
            },
        };

        if (timerDuration > 0) {
            swalConfig.timer = timerDuration;
        }

        return Swal.fire(swalConfig);
    }

    alertLoading(title: string): Promise<SweetAlertResult> {
        return Swal.fire({
            title: title,
            text: 'Por favor, espere...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    // Function to close the loading modal
    closeAlert(): void {
        Swal.close();
    }

    alertInfo(title: string): Promise<SweetAlertResult> {
        return Swal.fire({
            title: title,
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 1000,
        });
    }

    alertWarning(title: string, text: string): Promise<SweetAlertResult> {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            buttonsStyling: false,
            showClass: {
                popup: 'animate__animated animate__flipInX'
            },
            customClass: {
                confirmButton: 'btn btn-warning text-white',
            },
            timer: 1500
        });
    }

    confirmClose(): typeof Swal {
        return Swal.mixin({
            confirmButtonText: 'Siguiente &rarr;',
            progressSteps: ['1', '2'],
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            showClass: {
                popup: 'animate__animated animate__flipInX'
            },
            customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger ms-2',
            }
        });
    }

    // --- FUNCTION FOR TOASTS --- //
    showToast(message: string, type: 'danger' | 'success' = 'danger', header: string = 'Notificación') {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newToast: ToastInfo = {
        header,
        body: message,
        type,
        time,
        delay: 5000
        };
        // We add the new toast to the list
        this.toasts.update(current => [...current, newToast]);
    }

    // Remove a toast from the list
    remove(toast: ToastInfo) {
        this.toasts.update(current => current.filter(t => t !== toast));
    }

    toastSuccess(message: string, title: string = 'Éxito') {
        this.showToast(message, 'success', title);
    }

    toastError(message: string, title: string = 'Error') {
        this.showToast(message, 'danger', title);
    }
}