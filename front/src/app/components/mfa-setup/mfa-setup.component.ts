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
  userInfo: { email: string | null; mfaEnabled: boolean } = {
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
  password = '';

  // Recovery codes
  recoveryCodes: string[] = [];

  // Loading tracking IDs
  private readonly componentLoadingId = 'mfa-setup-component';
  private readonly qrCodeLoadingId = 'mfa-setup-qr-code';

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

    // Get current user info
    this.userInfo = this.authService.getCurrentUserInfo();
    if (!this.userInfo.email) {
      this.notificationService.showError(
        'Please log in again to access this page'
      );
      this.router.navigate(['/login']);
      this.loadingService.stopLoading(this.componentLoadingId);
    } else {
      // Component is fully initialized
      this.loadingService.stopLoading(this.componentLoadingId);
    }
  }

  // Start MFA setup process
  startMfaSetup(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.userInfo.email) {
      // Track QR code loading
      this.loadingService.startLoading(this.qrCodeLoadingId);

      this.authService
        .generateMfaSecret(this.userInfo.email)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            this.secretKey = response.secret;
            this.qrCodeUrl = response.qrCode;
            this.setupStarted = true;
            this.step = 1;
          },
          error: (error) => {
            this.errorMessage =
              error.message ||
              'Failed to generate MFA secret. Please try again.';
            // Stop tracking QR code loading on error
            this.loadingService.stopLoading(this.qrCodeLoadingId);
          },
        });
    } else {
      this.errorMessage = 'User email is missing. Please log in again.';
      this.isLoading = false;
      // Stop tracking QR code loading since we have an error
      this.loadingService.stopLoading(this.qrCodeLoadingId);
    }
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
            // Generate sample recovery codes (in production these would come from the backend)
            this.recoveryCodes = this.generateSampleRecoveryCodes();
            // Move to step 3 to show recovery codes
            this.nextStep();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'Failed to enable MFA. Please try again.';
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

  // Generate sample recovery codes (in production these would come from the backend)
  private generateSampleRecoveryCodes(): string[] {
    return [
      'AB12-CD34-EF56',
      'GH78-IJ90-KL12',
      'MN34-OP56-QR78',
      'ST90-UV12-WX34',
      'YZ56-AB78-CD90',
      'EF12-GH34-IJ56',
      'KL78-MN90-OP12',
      'QR34-ST56-UV78',
    ];
  }

  // Disable MFA
  disableMfa(): void {
    if (!this.password) {
      this.errorMessage = 'Please enter your password';
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
            error.message || 'Failed to disable MFA. Please try again.';
        },
      });
  }
}
