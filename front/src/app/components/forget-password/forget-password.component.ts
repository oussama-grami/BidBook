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
  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;
  currentStep: 'email' | 'reset' = 'email';

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgetPasswordForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchingValidator }
    );
  }

  passwordMatchingValidator(control: FormGroup) {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (
      this.currentStep === 'email' &&
      this.forgetPasswordForm.get('email')?.valid
    ) {
      // In a real app, you would send a reset code to the email
      this.currentStep = 'reset';
    } else if (this.currentStep === 'reset' && this.forgetPasswordForm.valid) {
      // In a real app, you would submit the new password
      this.router.navigate(['/login']);
    }
  }
}
