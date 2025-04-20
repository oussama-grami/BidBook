import {
  ApplicationConfig,
  provideAppInitializer,
  importProvidersFrom,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from './shared/mytheme';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { CredentialsInterceptor } from './shared/interceptors/credentials.interceptor';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { TokenValidationInterceptor } from './shared/interceptors/token-validation.interceptor';
import { AuthInitializationService } from './shared/services/auth-initialization.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    MessageService,

    // Register HTTP interceptors
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenValidationInterceptor,
      multi: true,
    },

    // Use provideAppInitializer for auth initialization
    provideAppInitializer(() => {
      const authInitService = inject(AuthInitializationService);
      authInitService.initializeAuth();
    }),

    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark-theme',
        },
      },
    }),
  ],
};
