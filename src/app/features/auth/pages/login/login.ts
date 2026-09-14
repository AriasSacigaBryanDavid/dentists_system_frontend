import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//SERVICES
import { AuthService } from '../../services/auth.service';

@Component({
  selector: "app-login",
  imports: [CommonModule, ReactiveFormsModule, NgbModule, RouterLink],
  templateUrl: "./login.html",
  styleUrl: "./login.scss",
  standalone: true
})
export class LoginComponent implements OnInit {
  
  // INJECTS
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  // UI States
  public coreConfig: any;
  public loading = false;
  public submitted = false;
  public passwordTextType = false;
  public errorMessage = '';

  public loginForm: FormGroup = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  get f() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    // We check to see if there is already a valid session
    if (this.authService.hasValidSession()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordTextType(): void {
    this.passwordTextType = !this.passwordTextType;
  }

  // --- ACTIONS --- //

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    // We extract the validated values from the form
    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      }
    });
  }
}
