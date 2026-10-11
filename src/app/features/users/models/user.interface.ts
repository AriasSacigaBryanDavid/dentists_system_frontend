import { BaseModel } from '@core/interfaces';

export enum UserRole {
    ADMIN = '00',
    DOCTOR = '02',
    RECEPTIONIST = '03',
}

export enum UserTurn {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
}

export const USER_ROLE_LABELS: Record<string, string> = {
    [UserRole.ADMIN]: 'Admin',
    [UserRole.DOCTOR]: 'Doctor',
    [UserRole.RECEPTIONIST]: 'Recepcionista',
};

export const USER_TURN_LABELS: Record<string, string> = {
    [UserTurn.MORNING]: 'Mañana',
    [UserTurn.AFTERNOON]: 'Tarde',
};

export interface UserModel extends BaseModel {
    username: string;
    first_name: string;
    last_name: string;
    email?: string;
    role: string;
    turn: string;
    password?: string;
    full_name?: string;
}
