import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

import { profile } from "../../../../data/header";
import { FeatherIcon } from "../../../ui/feather-icon/feather-icon";
import { AuthService } from '@/app/features/auth/services/auth.service';
@Component({
  selector: "app-profile",
  imports: [RouterModule, FeatherIcon],
  templateUrl: "./profile.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./profile.scss",
})
export class Profile {
  private router = inject(Router);
  public authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }

  public profile = profile;
}
