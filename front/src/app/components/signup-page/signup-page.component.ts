import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    NgOptimizedImage,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css',
})
export class SignupPageComponent {
  signupForm: FormGroup;
  facebookHovered = false;
  googleHovered = false;
  isLoading = false;
  errorMessage = '';
  profileImagePreview: string | null = null;
  selectedProfileImage: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      profileImage: [null], // Optional profile image field
      agreeTerms: [false, Validators.requiredTrue],
    });
  }

  // Handle profile image selection
  onProfileImageSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      // Validate file type and size
      const validImageTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
      ];
      if (!validImageTypes.includes(file.type)) {
        this.errorMessage =
          'Please select a valid image file (JPEG, PNG, JPG, GIF)';
        return;
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should not exceed 5MB';
        return;
      }

      // Store the file for later upload
      this.selectedProfileImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result as string;
        this.cdr.detectChanges(); // Force UI update
      };
      reader.readAsDataURL(file);

      // Clear any previous error messages
      this.errorMessage = '';
    }
  }

  passwordMatchingValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSignup() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const userData = {
        fisrtname: this.signupForm.value.firstName || '',
        lastname: this.signupForm.value.lastName || '',
        email: this.signupForm.value.email || '',
        password: this.signupForm.value.password || '',
        imgUrl: this.selectedProfileImage || undefined,
      };

      this.authService
        .register(userData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess(
                'Registration successful! Please check your email to verify your account.'
              );

              // Show pending verification page or redirect to a specific page
              // For now, we'll redirect to login page
              this.router.navigate(['/login']);
            } else {
              this.errorMessage = response.message;
            }
          },
          error: (error) => {
            this.errorMessage =
              error.message || 'Registration failed. Please try again.';
          },
        });
    } else {
      // Mark all fields as touched to trigger validation
      this.signupForm.markAllAsTouched();
      Object.keys(this.signupForm.controls).forEach((key) => {
        const control = this.signupForm.get(key);
        control?.markAsDirty();
      });
    }
  }
}
