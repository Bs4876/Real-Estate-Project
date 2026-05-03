import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RateLimitInterceptor } from './services/rate-limit.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
// --- הוסיפי את הייבוא הזה ---
import { MessageService } from 'primeng/api'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({ 
        theme: { preset: Aura }
    }),
    // --- הוסיפי את השירות כאן ---
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: RateLimitInterceptor, multi: true }
  ]
};