import { BaseModel } from '@core/interfaces';

export enum ReservationState {
    PENDING = 1,
    CONFIRMED = 2,
    COMPLETED = 3,
    CANCELED = 4,
}

export const RESERVATION_STATE_LABELS: Record<number, string> = {
    [ReservationState.PENDING]: 'Pendiente',
    [ReservationState.CONFIRMED]: 'Confirmada',
    [ReservationState.COMPLETED]: 'Completada',
    [ReservationState.CANCELED]: 'Cancelada',
};

export const RESERVATION_STATE_BADGES: Record<number, string> = {
    [ReservationState.PENDING]: 'bg-warning-subtle text-warning',
    [ReservationState.CONFIRMED]: 'bg-info-subtle text-info',
    [ReservationState.COMPLETED]: 'bg-success-subtle text-success',
    [ReservationState.CANCELED]: 'bg-danger-subtle text-danger',
};

export interface ReservationModel extends BaseModel {
    customer: string;
    doctor: string;
    date_time: string;
    observation?: string;
    states: number;
    customer_name?: string;
    doctor_name?: string;
    state_display?: string;
}
