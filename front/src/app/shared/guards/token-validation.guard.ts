import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable, catchError, map, of, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenValidationGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // If we're already on the login or signup page, allow access without checking tokens
    if (
      state.url.includes('/login') ||
      state.url.includes('/signup') ||
      state.url.includes('/auth/callback') ||
      state.url.includes('/verify-email')
    ) {
      return of(true);
    }

    // Try to validate token by requesting the user profile from the server directly
    // Don't check local auth state first, always verify with backend
    return this.authService.getProfile().pipe(
      take(1),
      map(() => {
        // If the profile request succeeds, the token is valid
        return true;
      }),
      catchError((error) => {
        // Always try to refresh the token if any error occurs
        return this.authService.refreshToken().pipe(
          switchMap(() => {
            // After refreshing token, try getting profile again
            return this.authService.getProfile().pipe(
              map(() => true),
              catchError(() => {
                // If profile still fails after refresh, redirect to login
                this.router.navigate(['/login']);
                return of(false);
              })
            );
          }),
          catchError(() => {
            // If token refresh fails, redirect to login
            this.router.navigate(['/login']);
            return of(false);
          })
        );
      })
    );
  }
}

// Function for use with the newer functional guards approach
export const tokenValidationGuard: CanActivateFn = (route, state) => {
  return inject(TokenValidationGuard).canActivate(route, state);
};
