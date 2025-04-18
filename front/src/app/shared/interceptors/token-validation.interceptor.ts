import { Injectable, inject, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class TokenValidationInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  // Use injector instead of directly injecting AuthService to break circular dependency
  constructor(private injector: Injector) {}

  // Lazy getter for AuthService to avoid circular dependency during initialization
  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip token validation for specific endpoints
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Handle 401 Unauthorized errors which indicate token issues
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    // Skip token validation for login, signup and refresh endpoints
    const skipUrls = [
      '/auth/login',
      '/auth/signup',
      '/auth/refresh',
      '/auth/verify-email',
      '/auth/profile', // Add profile endpoint to avoid circular requests during initialization
    ];

    return skipUrls.some((endpoint) => url.includes(endpoint));
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Attempt to refresh the token
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);

          // Retry the original request now that we have a new token
          return next.handle(request);
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;

          // If refresh fails, log out the user
          this.authService.clearAuthData();

          // Since we're using HTTP-only cookies, we can't actually add a new token
          // to the request. Instead, we should redirect to login or just pass the error
          return throwError(() => refreshError);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Wait for the token to be refreshed
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap(() => next.handle(request))
      );
    }
  }
}
