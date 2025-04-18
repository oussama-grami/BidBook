import { Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthInitializationService {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Initialize the authentication state by checking for valid tokens
   * and fetching the user profile if tokens exist
   */
  initializeAuth(): Observable<boolean> {
    // Always attempt to load the profile first, regardless of local token state
    return this.authService.getProfile().pipe(
      map((user) => {
        return true;
      }),
      catchError((error) => {
        // If profile fetch fails for any reason, try refreshing the token
        return this.authService.refreshToken().pipe(
          switchMap(() => {
            // After refreshing token, try getting profile again
            return this.authService.getProfile().pipe(
              map((user) => {
                return true;
              }),
              catchError((profileError) => {
                // Only clear auth data if we're sure authentication failed completely
                this.authService.clearAuthData();
                // Don't redirect here, let the app continue loading
                // The guard will handle redirects for protected routes
                return of(false);
              })
            );
          }),
          catchError((refreshError) => {
            // Clear auth data since refresh failed
            this.authService.clearAuthData();
            // Don't redirect here, let the app continue loading
            return of(false);
          })
        );
      })
    );
  }
}
