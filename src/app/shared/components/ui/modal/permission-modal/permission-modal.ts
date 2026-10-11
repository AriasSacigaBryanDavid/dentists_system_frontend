import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { permissions } from '../../../../data/user';
import { IModule } from '../../../../interface/user';

@Component({
  selector: 'app-permission-modal',
  imports: [],
  templateUrl: './permission-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './permission-modal.scss',
})
export class PermissionModal {
  private modal = inject(NgbActiveModal);

  public permissions = permissions;
  public selectedPermission: number[] = [];

  closeModal() {
    this.modal.close();
  }

  checkUncheckAll(event: Event, module: IModule) {
    module.module_permission.forEach((item) => {
      item.is_checked = (<HTMLInputElement>event.target).checked;
      this.addPermission(
        (<HTMLInputElement>event.target).checked,
        item?.id,
        module,
      );
    });
  }

  onPermissionChecked(event: Event, module: IModule) {
    module.module_permission.forEach((item) => {
      item.is_checked = false;
      if (item.name == 'index') {
        item.is_checked = !item.is_checked ? true : false;
        this.addPermission(true, +item.id, module);
      }
      this.addPermission(
        (<HTMLInputElement>event.target)?.checked,
        +(<HTMLInputElement>event?.target)?.value,
        module,
      );
    });
  }

  addPermission(checked: Boolean, value: number, module: IModule) {
    const index = this.selectedPermission.indexOf(Number(value));
    if (checked) {
      if (index == -1) this.selectedPermission.push(Number(value));
    } else {
      this.selectedPermission = this.selectedPermission.filter(
        (id) => id != Number(value),
      );
    }
    this.updateCheckBoxStatus(module);
  }

  updateCheckBoxStatus(module: IModule) {
    let count = 0;
    module.module_permission.filter((permission) => {
      if (this.selectedPermission.includes(permission.id!)) {
        count++;
      }
      if (module.module_permission.length <= count) module.is_checked = true;
      else module.is_checked = false;
    });
  }
}
