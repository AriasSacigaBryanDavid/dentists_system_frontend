import { Injectable } from '@angular/core';
import { CommonCrudService } from '@/app/core/services/common.service';
import { ReservationModel } from '../models';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class ReservationsService extends CommonCrudService<ReservationModel> {
    protected override baseUrl = `${environment.apiUrlConsult}reservations`;
}
