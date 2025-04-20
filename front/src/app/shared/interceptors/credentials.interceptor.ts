import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Only add withCredentials to requests going to our API
    if (request.url.startsWith(environment.apiUrl)) {
      request = request.clone({
        withCredentials: true,
      });
    }

    return next.handle(request);
  }
}
