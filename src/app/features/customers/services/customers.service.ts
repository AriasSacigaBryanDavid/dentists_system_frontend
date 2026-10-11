import { Injectable } from '@angular/core';
import { CommonCrudService } from '@/app/core/services/common.service';
import { CustomerModel } from '../models';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomersService extends CommonCrudService<CustomerModel> {
    protected override baseUrl = `${environment.apiUrlConsult}customers`;
}