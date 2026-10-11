import { Injectable } from '@angular/core';
import { CommonCrudService } from '@/app/core/services/common.service';
import { UserModel } from '../models';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService extends CommonCrudService<UserModel> {
    protected override baseUrl = `${environment.apiUrlConsult}users`;
}
