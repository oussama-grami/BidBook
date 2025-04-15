import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Mock storage for user MFA status - in a real app this would come from the backend
  private mfaEnabled: boolean = false;
  private mfaSecret: string | null = null;
  private userEmail: string | null = null;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Try to load MFA status from localStorage on service initialization
    this.loadMfaStatus();
  }

  // Load MFA status from storage
  private loadMfaStatus(): void {
    if (typeof window !== 'undefined') {
      this.mfaEnabled = localStorage.getItem('mfa_enabled') === 'true';
      this.mfaSecret = localStorage.getItem('mfa_secret');
      this.userEmail = localStorage.getItem('user_email');
    }
  }

  // Save MFA status to storage
  private saveMfaStatus(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfa_enabled', this.mfaEnabled.toString());
      if (this.mfaSecret) {
        localStorage.setItem('mfa_secret', this.mfaSecret);
      }
      if (this.userEmail) {
        localStorage.setItem('user_email', this.userEmail);
      }
    }
  }

  // Check if a user has MFA enabled
  hasOtpEnabled(email: string): boolean {
    // In a real app, this would check with the backend
    if (email === this.userEmail) {
      return this.mfaEnabled;
    }
    return false;
  }

  // Generate a new MFA secret
  generateMfaSecret(
    email: string
  ): Observable<{ secret: string; qrCode: string }> {
    // In a real app, this would call the backend to generate a proper secret
    // For demo purposes, we'll create a mock secret
    const mockSecret = 'ABCDEF123456789';
    const mockQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/BooksApp:${encodeURIComponent(
      email
    )}?secret=${mockSecret}&issuer=BooksApp`;

    // Store the secret
    this.mfaSecret = mockSecret;
    this.userEmail = email;

    return of({
      secret: mockSecret,
      qrCode: mockQrCodeUrl,
    }).pipe(delay(500));
  }

  // Enable MFA for user with explicit type annotation
  enableMfa(
    otpCode: string
  ): Observable<{ success: boolean; message: string }> {
    // In a real app, this would validate the OTP with the backend
    const isValid: boolean = otpCode.length === 6;

    if (isValid) {
      this.mfaEnabled = true;
      this.saveMfaStatus();
    }

    return of<{ success: boolean; message: string }>({
      success: isValid,
      message: isValid ? 'MFA enabled successfully' : 'Invalid OTP code',
    }).pipe(delay(500));
  }

  // Disable MFA for user with explicit type annotation
  disableMfa(
    password: string
  ): Observable<{ success: boolean; message: string }> {
    // In a real app, this would verify the password with the backend
    const isValid = password!=null && password.length >= 6;

    if (isValid) {
      this.mfaEnabled = false;
      this.saveMfaStatus();
    }

    return of<{ success: boolean; message: string }>({
      success: isValid,
      message: isValid ? 'MFA disabled successfully' : 'Invalid password',
    }).pipe(delay(500));
  }

  // Initial login attempt that checks if OTP is required
  initiateLogin(
    email: string,
    password: string
  ): Observable<{ requiresOtp: boolean; message: string }> {
    // Store email for future use
    this.userEmail = email;

    // Simulate API call with delay
    return of<{ requiresOtp: boolean; message: string }>({
      requiresOtp: this.hasOtpEnabled(email),
      message: this.hasOtpEnabled(email)
        ? 'OTP required to complete login'
        : 'Login successful',
    }).pipe(delay(800)); // Simulate network delay
  }

  // Verify the OTP code with explicit type annotation
  verifyOtp(
    email: string,
    otpCode: string
  ): Observable<{ success: boolean; message: string }> {
    // Simulate API call with delay
    return of<{ success: boolean; message: string }>({
      success: otpCode.length === 6, // Simple validation that OTP is 6 digits
      message:
        otpCode.length === 6
          ? 'OTP verification successful'
          : 'Invalid OTP code',
    }).pipe(delay(800)); // Simulate network delay
  }

  completeLogin(): void {
    // Set auth token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
    }

    this.notificationService.showSuccess('Login successful');
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }

  // Get current user info (mock implementation)
  getCurrentUserInfo(): { email: string | null; mfaEnabled: boolean } {
    return {
      email: this.userEmail,
      mfaEnabled: this.mfaEnabled,
    };
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }

    // Show a success notification
    this.notificationService.showSuccess(
      'You have been successfully logged out'
    );

    // Navigate to login page
    this.router.navigate(['/login']);
  }
}