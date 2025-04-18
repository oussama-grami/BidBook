import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { ImagePreloadDirective } from '../../shared/directives/image-preload.directive';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    MessageModule,
    ImagePreloadDirective,
  ],
  templateUrl: './mfa-setup.component.html',
  styleUrls: ['./mfa-setup.component.css'],
  animations: [
    // Add page-specific enter/exit animations as needed
  ],
})
export class MfaSetupComponent implements OnInit {
  // User info
  userInfo: {
    email: string | null;
    mfaEnabled: boolean;
  } = {
    email: null,
    mfaEnabled: false,
  };

  // MFA setup state
  setupStarted = false;
  step = 1;
  isLoading = false;
  errorMessage = '';

  // MFA data
  secretKey = '';
  qrCodeUrl = '';
  otpCode = '';

  // Recovery codes
  recoveryCodes: string[] = [];

  // Loading tracking IDs
  private readonly componentLoadingId = 'mfa-setup-component';
  private readonly qrCodeLoadingId = 'mfa-setup-qr-code';
  password: any;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Start the component loading tracker
    this.loadingService.startLoading(this.componentLoadingId);

    // Check authentication status
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.loadingService.stopLoading(this.componentLoadingId);
      return;
    }

    // Get current user info from local storage initially
    this.userInfo = this.authService.getCurrentUserInfo();
    if (!this.userInfo.email) {
      this.notificationService.showError(
        'Please log in again to access this page'
      );
      this.router.navigate(['/login']);
      this.loadingService.stopLoading(this.componentLoadingId);
      return;
    }

    // Fetch latest user profile from server to get current MFA status
    this.fetchCurrentMfaStatus();
  }

  // Fetch the current MFA status from the server
  private fetchCurrentMfaStatus(): void {
    this.isLoading = true;
    this.loadingService.startLoading('fetching-mfa-status');

    this.authService
      .getProfile()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stopLoading('fetching-mfa-status');
          this.loadingService.stopLoading(this.componentLoadingId);
        })
      )
      .subscribe({
        next: (user) => {
          // Update the MFA status based on the latest from server
          this.userInfo = {
            email: user.email,
            mfaEnabled: user.isMFAEnabled || false,
          };

          // Force change detection to update the view
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to fetch user profile:', error);
          this.notificationService.showError(
            'Failed to fetch current MFA status. Using cached information.'
          );
        },
      });
  }

  // Start MFA setup process
  startMfaSetup(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Track QR code loading
    this.loadingService.startLoading(this.qrCodeLoadingId);

    this.authService
      .generateMfaSecret()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          console.log('MFA secret response:', response);
          this.secretKey = response.secret;
          this.qrCodeUrl = response.qrCode;
          this.setupStarted = true;
          this.step = 1;
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to generate MFA secret. Please try again.';
          // Stop tracking QR code loading on error
          this.loadingService.stopLoading(this.qrCodeLoadingId);
        },
      });
  }

  // Handle QR code image load completion
  onQrCodeLoaded(success: boolean): void {
    this.loadingService.stopLoading(this.qrCodeLoadingId);
    if (!success) {
      this.errorMessage = 'Failed to load QR code image. Please try again.';
    }
  }

  // Move to next step in setup process
  nextStep(): void {
    if (this.step < 3) {
      this.step++;
      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
    }
  }

  // Move to previous step in setup process
  previousStep(): void {
    if (this.step > 1) {
      this.step--;
      this.errorMessage = '';
      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
    }
  }

  // Enable MFA with verification code
  enableMfa(): void {
    if (this.otpCode.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit code';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .enableMfa(this.otpCode)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Move to step 3 to show recovery codes
            this.recoveryCodes = response.recoveryCodes;
            this.nextStep();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          console.error('Error enabling MFA:', error);
          this.errorMessage =
            error.error?.message || 'Failed to enable MFA. Please try again.';
        },
      });
  }

  // Finish MFA setup
  finishSetup(): void {
    this.notificationService.showSuccess(
      'Two-factor authentication enabled successfully'
    );
    this.userInfo.mfaEnabled = true;
    this.setupStarted = false;
    this.step = 1;
  }

  // Disable MFA
  disableMfa(): void {
    if (!this.password) {
      this.errorMessage =
        'Password is required to disable two-factor authentication';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .disableMfa(this.password)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(
              'Two-factor authentication disabled successfully'
            );
            this.userInfo.mfaEnabled = false;
            this.setupStarted = false;
            this.password = '';
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Failed to disable MFA. Please try again.';
        },
      });
  }
}
