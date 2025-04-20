import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProgressSpinnerModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.css',
})
export class EmailVerificationComponent implements OnInit {
  token: string | null = null;
  isLoading: boolean = true;
  isVerified: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Extract token from URL query parameters
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];

      if (this.token) {
        this.verifyEmailToken();
      } else {
        this.isLoading = false;
        this.errorMessage = 'Verification token is missing.';
      }
    });
  }

  protected verifyEmailToken(): void {
    this.isLoading = true;

    this.authService
      .verifyEmailToken(this.token!)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.isVerified = true;
          } else {
            this.errorMessage =
              response.message || 'Email verification failed.';
          }
        },
        error: (error) => {
          this.errorMessage =
            error.message ||
            'An error occurred during email verification. Please try again.';
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendVerification(): void {
    if (!this.authService.getCurrentUserInfo().email) {
      this.errorMessage =
        'Unable to resend verification email. Please sign up again.';
      return;
    }

    this.isLoading = true;
    const email = this.authService.getCurrentUserInfo().email;

    this.authService
      .resendVerificationEmail(email!)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.errorMessage = '';
            alert('Verification email has been sent. Please check your inbox.');
          } else {
            this.errorMessage =
              response.message || 'Failed to resend verification email.';
          }
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'An error occurred. Please try again.';
        },
      });
  }
}
