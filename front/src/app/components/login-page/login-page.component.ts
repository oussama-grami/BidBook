import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from '../../../environments/environment.development';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    NgOptimizedImage,
    MessageModule,
    ProgressSpinnerModule,
    CheckboxModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  loginForm: FormGroup;
  otpForm: FormGroup;
  facebookHovered: boolean = false;
  googleHovered: boolean = false;

  isLoading = false;
  requiresOtp = false;
  showOtpStep = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.otpForm = this.fb.group({
      otpCode: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      this.isLoading = true;
      this.errorMessage = '';

      this.authService
        .initiateLogin(email, password, rememberMe)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.requiresOtp) {
              this.showOtpStep = true;
              this.requiresOtp = true;
            } else {
              if (response.success) {
                this.authService.completeLogin();
              } else {
                this.errorMessage = response.message;
              }
            }
          },
          error: (error) => {
            this.errorMessage =
              error.message || 'Login failed. Please try again.';
          },
        });
    } else {
      this.loginForm.markAllAsTouched();
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        control?.markAsDirty();
      });
    }
  }

  onVerifyOtp() {
    if (this.otpForm.valid) {
      const { otpCode } = this.otpForm.value;
      this.isLoading = true;
      this.errorMessage = '';
      console.log(this.loginForm.controls['rememberMe'].value);
      this.authService
        .verifyOtp(otpCode,this.loginForm.controls['rememberMe'].value)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            console.log(response);
            if (response.success) {
            } else {
              this.errorMessage = response.message;
            }
          },
          error: (error) => {
            this.errorMessage =
              error.message || 'OTP verification failed. Please try again.';
          },
        });
    } else {
      // Mark all fields as touched to trigger validation
      this.otpForm.markAllAsTouched();
      Object.keys(this.otpForm.controls).forEach((key) => {
        const control = this.otpForm.get(key);
        control?.markAsDirty();
      });
    }
  }

  backToLogin() {
    this.showOtpStep = false;
    this.requiresOtp = false;
    this.otpForm.reset();
    this.errorMessage = '';
  }

  loginWithGoogle() {
    const apiUrl = environment.apiUrl;
    window.location.href = `${apiUrl}/auth/google`;
  }

  loginWithGithub() {
    const apiUrl = environment.apiUrl;
    window.location.href = `${apiUrl}/auth/github`;
  }
}
