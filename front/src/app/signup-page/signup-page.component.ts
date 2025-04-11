import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PasswordModule} from 'primeng/password';
import {CheckboxModule} from 'primeng/checkbox';
import {RippleModule} from 'primeng/ripple';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    CheckboxModule,
    RippleModule,
    NgOptimizedImage
  ],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
  signupForm: FormGroup;
  facebookHovered = false;
  googleHovered = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  passwordMatchingValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return {passwordMismatch: true};
    }
    return null;
  }

  onSignup() {
    if (this.signupForm.valid) {
      // In a real application, you would call a registration service
      console.log('Signup form submitted', this.signupForm.value);
      // Redirect to login page after successful registration
      this.router.navigate(['/login']);
    } else {
      // Mark all fields as touched to trigger validation
      this.signupForm.markAllAsTouched();
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsDirty();
      });
    }
  }
}
