import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { LoadingService } from './loading.service';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  tap,
  throwError,
  timeout,
  finalize,
} from 'rxjs';
import {
  AuthenticationService,
  LoginDto,
  MfaEnableDto,
  MfaVerifyDto,
  SignUpResponseDto,
  UserDto,
  VerifyEmailDto,
  DisableMfaDto,
} from './Api';
import { UserIdService } from './userid.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Track user state
  private mfaEnabled: boolean = false;
  private mfaSecret: string | null = null;
  private userEmail: string | null = null;
  private emailVerified: boolean = false;

  // Track authentication state
  private authState = new BehaviorSubject<boolean>(false);
  public authState$ = this.authState.asObservable();
  private currentUser = new BehaviorSubject<UserDto | null>(null);
  public currentUser$ = this.currentUser.asObservable();

  // Token refresh
  private isRefreshing = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private apiAuthService: AuthenticationService,
    private loadingService: LoadingService,
    private userIdService: UserIdService
  ) {
    // Try to load user state from localStorage on service initialization
    this.loadUserState();

    // Check authentication status on startup
    if (this.isAuthenticated()) {
      this.loadUserData();
      this.authState.next(true);
    }
  }

  // Load user state from storage
  private loadUserState(): void {
    if (typeof window !== 'undefined') {
      this.mfaEnabled = localStorage.getItem('mfa_enabled') === 'true';
      this.mfaSecret = localStorage.getItem('mfa_secret');
      this.userEmail = localStorage.getItem('user_email');
      this.emailVerified = localStorage.getItem('email_verified') === 'true';

      // Try to load saved user data
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUser.next(user);
        } catch (e) {}
      }
    }
  }

  // Save user state to storage
  private saveUserState(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfa_enabled', this.mfaEnabled.toString());
      if (this.mfaSecret) {
        localStorage.setItem('mfa_secret', this.mfaSecret);
      }
      if (this.userEmail) {
        localStorage.setItem('user_email', this.userEmail);
      }
      localStorage.setItem('email_verified', this.emailVerified.toString());
    }
  }

  // Load user data from server
  private loadUserData(): void {
    this.getProfile().subscribe({
      next: (user) => {
        // User is authenticated, update state
        this.authState.next(true);
        if (user && user.id) {
          this.userIdService.setUserId(user.id); // Set user ID on profile load
        } else {
          console.warn('User ID not found in profile data:', user);
        }
      },
      error: (err) => {
        // Failed to get profile, might be auth issue
        if (err.status === 401) {
          this.refreshToken().subscribe({
            next: () => this.getProfile().subscribe(),
            error: () => {
              // If refresh also failed, clear auth state
              this.clearAuthData();
              this.authState.next(false);
            },
          });
        } else {
          this.clearAuthData();
          this.authState.next(false);
        }
      },
    });
  }

  // Check if a user has MFA enabled
  hasOtpEnabled(email: string): boolean {
    return this.mfaEnabled;
  }

  // Generate a new MFA secret from API
  generateMfaSecret(): Observable<{ secret: string; qrCode: string }> {
    return this.apiAuthService.authControllerGenerateMfaSecret().pipe(
      tap((response) => {
        this.mfaSecret = response.secret;
        this.saveUserState();
      }),
      catchError((error) => {
        this.notificationService.showError('Failed to generate MFA secret');
        return throwError(() => error);
      })
    );
  }

  // Enable MFA for user
  enableMfa(otpCode: string): Observable<{
    success: boolean;
    message: string;
    recoveryCodes: string[];
  }> {
    const mfaEnableDto: MfaEnableDto = {
      code: otpCode,
    };

    return this.apiAuthService.authControllerEnableMfa(mfaEnableDto).pipe(
      map((response) => {
        this.mfaEnabled = true;
        this.saveUserState();
        return {
          success: true,
          message: 'MFA enabled successfully',
          recoveryCodes: response.recoveryCodes,
        };
      }),
      catchError((error) => {
        const message = error.error?.message || 'Failed to enable MFA';
        this.notificationService.showError(message);
        return of({ success: false, message, recoveryCodes: [] });
      })
    );
  }

  // Disable MFA for user
  disableMfa(
    password: string
  ): Observable<{ success: boolean; message: string }> {
    const disableMfaDto: DisableMfaDto = {
      password,
    };

    return this.apiAuthService.authControllerDisableMfa(disableMfaDto).pipe(
      map((response) => {
        this.mfaEnabled = false;
        this.saveUserState();
        return { success: true, message: 'MFA disabled successfully' };
      }),
      catchError((error) => {
        const message = error.error?.message || 'Failed to disable MFA';
        this.notificationService.showError(message);
        return of({ success: false, message });
      })
    );
  }

  // Initial login attempt
  initiateLogin(
    email: string,
    password: string,
    rememberMe: boolean
  ): Observable<{ requiresOtp: boolean; message: string; success: boolean }> {
    const loginDto: LoginDto = {
      email,
      password,
      rememberMe: true,
    };

    return this.apiAuthService.authControllerLogin(loginDto).pipe(
      map((response) => {
        this.userEmail = email;
        // If MFA is required
        if ('isMfaRequired' in response) {
          return {
            requiresOtp: true,
            message: 'OTP required to complete login',
            success: false,
          };
        }

        // Regular login success
        this.setAuthData(response.user);
        this.completeLogin();
        return {
          requiresOtp: false,
          message: 'Login successful',
          success: true,
        };
      }),
      catchError((error) => {
        const message = error.error?.message || 'Login failed';
        this.notificationService.showError(message);
        return of({ requiresOtp: false, message, success: false });
      })
    );
  }

  // Verify the OTP code
  verifyOtp(
    code: string,
    rememberMe: boolean
  ): Observable<{
    success: boolean;
    message: string;
  }> {
    const mfaVerifyDto: MfaVerifyDto = {
      code,
      rememberMe,
    };

    return this.apiAuthService.authControllerVerifyMfaToken(mfaVerifyDto).pipe(
      map((response) => {
        if (response.user) {
          this.setAuthData(response.user);
          this.completeLogin();
        }
        return { success: true, message: 'OTP verification successful' };
      }),
      catchError((error) => {
        const message = error.error?.message || 'Invalid OTP code';
        this.notificationService.showError(message);
        return of({ success: false, message });
      })
    );
  }

  // Register a new user
  register(userData: {
    fisrtname: string;
    lastname: string;
    email: string;
    password: string;
    imgUrl?: File;
  }): Observable<{ success: boolean; message: string }> {
    return this.apiAuthService
      .authControllerSignUp(
        userData.fisrtname,
        userData.lastname,
        userData.email,
        userData.password,
        userData.imgUrl
      )
      .pipe(
        map((response: SignUpResponseDto) => {
          this.userEmail = userData.email;
          this.emailVerified = false;
          this.saveUserState();
          this.notificationService.showSuccess(
            'Registration successful! Please check your email to verify your account.'
          );
          return {
            success: true,
            message:
              'Registration successful! Please check your email to verify your account.',
          };
        }),
        catchError((error) => {
          const message = error.error?.message || 'Registration failed';
          this.notificationService.showError(message);
          return of({ success: false, message });
        })
      );
  }

  // Verify email token
  verifyEmailToken(
    token: string
  ): Observable<{ success: boolean; message: string }> {
    const verifyEmailDto: VerifyEmailDto = {
      token,
    };

    return this.apiAuthService.authControllerVerifyEmail(verifyEmailDto).pipe(
      map((response) => {
        this.emailVerified = true;
        this.saveUserState();
        this.notificationService.showSuccess('Email verified successfully');
        return { success: true, message: 'Email verified successfully' };
      }),
      catchError((error) => {
        const message =
          error.error?.message || 'Invalid or expired verification token';
        this.notificationService.showError(message);
        return of({ success: false, message });
      })
    );
  }

  // Resend verification email - mock implementation until API supports it
  resendVerificationEmail(
    email: string
  ): Observable<{ success: boolean; message: string }> {
    // This is still mocked as it seems this endpoint might not exist yet
    return of({
      success: true,
      message: 'Verification email has been sent to ' + email,
    });
  }

  // Refresh the access token using the refresh token in HTTP-only cookies
  refreshToken(): Observable<any> {
    if (this.isRefreshing) {
      return of(null);
    }

    this.isRefreshing = true;

    return this.apiAuthService.authControllerRefreshToken().pipe(
      map((response) => {
        // Token is refreshed and stored in cookies by the backend
        this.isRefreshing = false;
        // Make sure authentication state is updated
        this.authState.next(true);

        // If we have cached user data, restore it
        const userData = localStorage.getItem('user_data');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            this.currentUser.next(user);
          } catch (e) {}
        }
        return response;
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.clearAuthData();
        this.authState.next(false);
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  // Check if user's email is verified
  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  completeLogin(): void {
    this.authState.next(true);
    this.notificationService.showSuccess('Login successful');
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }

  // Get current user info
  getCurrentUserInfo(): {
    email: string | null;
    mfaEnabled: boolean;
    emailVerified: boolean;
  } {
    return {
      email: this.userEmail,
      mfaEnabled: this.mfaEnabled,
      emailVerified: this.emailVerified,
    };
  }

  // Set authentication data from login/social response
  setAuthData(userData: any): void {
    if (typeof window !== 'undefined' && userData) {
      // Store user data
      localStorage.setItem('auth_token', 'token_exists'); // The actual token is in HTTP-only cookies
      localStorage.setItem('user_email', userData.email || '');
      localStorage.setItem('user_data', JSON.stringify(userData));

      // Update local state
      this.userEmail = userData.email;
      this.emailVerified = userData.emailVerified ?? true;
      this.mfaEnabled = userData.isMfaEnabled || false;
      this.saveUserState();

      // Update BehaviorSubjects
      this.currentUser.next(userData);
      this.authState.next(true);
      if (userData.id) { // Assuming your UserDto has an 'id' property
        this.userIdService.setUserId(userData.id);
      } else {
        console.warn('User ID not found in userData:', userData);
      }
    }
  }

  // Clear all authentication data
  public clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_email');
      localStorage.removeItem('mfa_enabled');
      localStorage.removeItem('mfa_secret');
      localStorage.removeItem('email_verified');
    }

    this.userEmail = null;
    this.mfaEnabled = false;
    this.mfaSecret = null;
    this.emailVerified = false;
    this.currentUser.next(null);
  }

  // Logout the user
  logout() {
    // First, force reset any existing loading state
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }

    // Import the loading service if it's not already imported
    const loadingService = this.loadingService;
    if (loadingService) {
      loadingService.forceResetLoading();
    }

    this.apiAuthService
      .authControllerLogout()
      .pipe(
        // Add timeout to prevent hanging if server is slow to respond
        timeout(5000),
        catchError((error) => {
          console.error('Logout error:', error);
          // Still proceed with local logout even if server request fails
          return of({ message: 'Logout completed locally' });
        })
      )
      .subscribe({
        next: () => this.completeLogout(),
        error: () => this.completeLogout(),
      });
  }

  // Helper method to handle logout completion
  private completeLogout(): void {
    // Clear all auth data
    this.clearAuthData();
    this.authState.next(false);

    // Show success message and navigate
    this.notificationService.showSuccess(
      'You have been successfully logged out'
    );

    // Navigate after a tiny delay to ensure loading state is cleared
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 10);
  }

  // Get user profile
  getProfile(): Observable<UserDto> {
    return this.apiAuthService.authControllerGetProfile().pipe(
      tap((user) => {
        if (user) {
          this.setAuthData(user);
          this.userEmail = user.email;
          this.mfaEnabled = user.isMFAEnabled || false;
          this.saveUserState();
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // Request a password reset
  forgotPassword(
    email: string
  ): Observable<{ success: boolean; message: string }> {
    return this.apiAuthService.authControllerForgotPassword({ email }).pipe(
      map((response) => {
        this.notificationService.showSuccess(
          'Password reset email sent. Please check your inbox.'
        );
        return { success: true, message: response.message };
      }),
      catchError((error) => {
        const message =
          error.error?.message || 'Failed to request password reset';
        this.notificationService.showError(message);
        return of({ success: false, message });
      })
    );
  }

  // Reset password with token
  resetPassword(
    token: string,
    password: string
  ): Observable<{ success: boolean; message: string }> {
    return this.apiAuthService
      .authControllerResetPassword({ token, password })
      .pipe(
        map((response) => {
          this.notificationService.showSuccess(
            'Password reset successful. You can now log in with your new password.'
          );
          return { success: true, message: response.message };
        }),
        catchError((error) => {
          const message = error.error?.message || 'Failed to reset password';
          this.notificationService.showError(message);
          return of({ success: false, message });
        })
      );
  }
}
