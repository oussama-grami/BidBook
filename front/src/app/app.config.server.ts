import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from './shared/mytheme';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
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

export const config = mergeApplicationConfig(appConfig, serverConfig);
