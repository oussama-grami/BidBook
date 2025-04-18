import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {AuthService} from '../../services/auth.service';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    NgOptimizedImage,
    MessageModule,
  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm!: FormGroup;
  currentStep: 'email' | 'reset' = 'email';
  isLoading = false;
  errorMessage = '';
  resetToken = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    // Initialize form with different validators based on step
    this.createForm();
  }

  createForm(): void {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: [''],
      newPassword: [''],
      confirmPassword: [''],
    });
  }

  // Update validators based on current step
  updateFormValidators(): void {
    const emailControl = this.forgetPasswordForm.get('email');
    const tokenControl = this.forgetPasswordForm.get('token');
    const newPasswordControl = this.forgetPasswordForm.get('newPassword');
    const confirmPasswordControl =
      this.forgetPasswordForm.get('confirmPassword');

    if (this.currentStep === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      tokenControl?.clearValidators();
      newPasswordControl?.clearValidators();
      confirmPasswordControl?.clearValidators();
    } else {
      emailControl?.clearValidators();

      if (!this.resetToken) {
        tokenControl?.setValidators([Validators.required]);
      } else {
        tokenControl?.clearValidators();
      }

      newPasswordControl?.setValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
      confirmPasswordControl?.setValidators([Validators.required]);
    }

    // Update form controls
    emailControl?.updateValueAndValidity();
    tokenControl?.updateValueAndValidity();
    newPasswordControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();

    // Apply password matching validator to the form
    this.forgetPasswordForm.setValidators(this.passwordMatchingValidatorFn());
    this.forgetPasswordForm.updateValueAndValidity();
  }

  ngOnInit(): void {
    // Check if there's a token in the URL parameters
    this.route.queryParams.subscribe((params) => {
      if (params['token']) {
        this.resetToken = params['token'];
        this.currentStep = 'reset';
        this.forgetPasswordForm.get('token')?.setValue(this.resetToken);
        this.updateFormValidators();
      }
    });
  }

  // Create a validator function that returns a ValidatorFn to fix the second error
  passwordMatchingValidatorFn(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup;
      const newPassword = form.get('newPassword');
      const confirmPassword = form.get('confirmPassword');

      if (
        newPassword?.value &&
        confirmPassword?.value &&
        newPassword.value !== confirmPassword.value
      ) {
        confirmPassword.setErrors({passwordMismatch: true});
        return {passwordMismatch: true};
      } else if (confirmPassword) {
        // Clear the error if passwords match
        const errors = {...confirmPassword.errors};
        if (errors) {
          delete errors['passwordMismatch'];
          confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
      return null;
    };
  }

  // Keep the original validator method for use in the constructor
  passwordMatchingValidator(control: FormGroup) {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (
      newPassword?.value &&
      confirmPassword?.value &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({passwordMismatch: true});
      return {passwordMismatch: true};
    } else if (confirmPassword) {
      // Clear the error if passwords match
      const errors = {...confirmPassword.errors};
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      this.currentStep === 'email' &&
      this.forgetPasswordForm.get('email')?.valid
    ) {
      this.isLoading = true;
      const email = this.forgetPasswordForm.get('email')?.value;

      this.authService
        .forgotPassword(email)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage =
                'Password reset instructions have been sent to your email.';
            } else {
              this.errorMessage = response.message;
            }
          },
          error: (error) => {
            this.errorMessage =
              error.error?.message ||
              'Failed to send reset email. Please try again.';
          },
        });
    } else if (this.currentStep === 'reset') {
      // Check if password fields are valid
      const newPasswordValid =
        this.forgetPasswordForm.get('newPassword')?.valid;
      const confirmPasswordValid =
        this.forgetPasswordForm.get('confirmPassword')?.valid;
      const passwordsMatch =
        this.forgetPasswordForm.get('newPassword')?.value ===
        this.forgetPasswordForm.get('confirmPassword')?.value;

      if (newPasswordValid && confirmPasswordValid && passwordsMatch) {
        this.isLoading = true;
        const token =
          this.resetToken || this.forgetPasswordForm.get('token')?.value;
        const password = this.forgetPasswordForm.get('newPassword')?.value;

        this.authService
          .resetPassword(token, password)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.successMessage = 'Password reset successful!';
                // Redirect to login page after a short delay
                setTimeout(() => {
                  this.router.navigate(['/login']);
                }, 2000);
              } else {
                this.errorMessage = response.message;
              }
            },
            error: (error) => {
              this.errorMessage =
                error.error?.message ||
                'Failed to reset password. Please try again.';
            },
          });
      }
    }
  }

  // Helper method to switch between steps
  switchToResetStep() {
    this.currentStep = 'reset';
    this.updateFormValidators();
  }
}
