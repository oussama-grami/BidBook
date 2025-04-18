import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.development';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  // Use Injector instead of directly injecting AuthService
  constructor(private injector: Injector) {}

  // Lazy getter for AuthService to avoid circular dependency
  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Only intercept requests to our API
    if (!request.url.startsWith(environment.apiUrl)) {
      return next.handle(request);
    }

    // Skip token refresh endpoint to avoid infinite loops
    if (request.url.includes('/auth/refresh')) {
      return next.handle(request);
    }

    // Skip MFA verification endpoints - we don't want to trigger token refresh for MFA errors
    if (request.url.includes('/auth')) {
      return next.handle(request).pipe(
        catchError((error) => {
          // Just propagate the error for MFA verification failures
          return throwError(() => error);
        })
      );
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          return next.handle(request);
        }),
        catchError((err) => {
          this.isRefreshing = false;

          // If refresh fails, log out the user
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      // Wait until refreshToken is completed, then retry the request
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap(() => next.handle(request))
      );
    }
  }
}
