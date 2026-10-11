import { BaseModel } from '@core/interfaces';

export interface CustomerModel extends BaseModel {
    uuid: string;
    first_name: string;
    last_name: string;
    address?: string;
    phone?: string;
    age?: number;
    full_name?: string;
}
