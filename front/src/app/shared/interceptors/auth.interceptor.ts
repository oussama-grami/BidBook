import {Injectable, Injector} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {BehaviorSubject, from, Observable, throwError} from 'rxjs';
import {catchError, filter, finalize, switchMap, take} from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {environment} from '../../../environments/environment.development';
import {Router} from '@angular/router';
import {NotificationService} from '../../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  // Use Injector instead of directly injecting AuthService
  constructor(
    private injector: Injector,
    private router: Router,
    private notificationService: NotificationService
  ) {
  }

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

    return next.handle(request).pipe(
      catchError((error) => {
        // Only handle 401 Unauthorized errors that are not from auth endpoints
        // This prevents infinite loops when trying to refresh during auth operations
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !request.url.includes('/auth/login') &&
          !request.url.includes('/auth/mfa/verify') &&
          !request.url.includes('/auth/verify-email')
        ) {
          return this.handle401Error(request, next);
        }

        // For all other errors, just propagate them to be handled by components
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    console.log('Handling 401 error : ', request.url, this.isRefreshing);
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Store the original request so we can retry it after token refresh
      return from(this.authService.refreshToken()).pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          console.log('Token refreshed successfully and this is the request ', request);
          // After a successful refresh, the cookies are automatically included
          // in subsequent requests because the browser handles them
          // We just need to retry the original request
          return next.handle(request);
        }),
        catchError((err) => {
          console.log("Error refreshing token: ", err);
          this.isRefreshing = false;

          // If refresh token fails, log out and redirect to login
          this.authService.clearAuthData();
          this.router.navigate(['/login'], {
            queryParams: {redirectUrl: this.router.url},
          });
          this.notificationService.showWarning(
            'Your session has expired. Please log in again.'
          );

          return throwError(() => err);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Wait until refreshToken is completed, then retry the request
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap(() => {
          // After token refresh is done by another request, retry this one
          return next.handle(request);
        })
      );
    }
  }
}
