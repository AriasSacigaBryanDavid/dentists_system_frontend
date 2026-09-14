import { Component, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";

import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-login",
  imports: [RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./login.html",
  styleUrl: "./login.scss",
})
export class Login {
  router = inject(Router);
  private toast = inject(ToastrService);

  public show: boolean = false;
  public loginForm: FormGroup;
  public validate: boolean = false;

  constructor() {
    const router = this.router;

    const userDetails = localStorage.getItem("user");
    if (userDetails?.length != null) {
      router.navigate(["/dashboard/default"]);
    }

    this.loginForm = new FormGroup({
      email: new FormControl("Test@gmail.com", [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl("test123", Validators.required),
    });
  }

  showPassword() {
    this.show = !this.show;
  }

  login() {
    this.validate = true;
    if (this.loginForm.valid) {
      if (
        this.loginForm.value["email"] == "Test@gmail.com" &&
        this.loginForm.value["password"] == "test123"
      ) {
        let user = {
          email: "Test@gmail.com",
          password: "test123",
          name: "test user",
        };
        localStorage.setItem("user", JSON.stringify(user));
        this.router.navigate(["/dashboard/default"]);
      } else {
        this.toast.error("Please Enter valid email or password...!", "", {
          positionClass: "toast-top-right",
          closeButton: true,
          timeOut: 2000,
        });
      }
    }
  }
}
