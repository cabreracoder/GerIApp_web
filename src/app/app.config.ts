import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './store/reducer';


import { routes } from './app.routes';


import {
  SocialAuthService,
  SOCIAL_AUTH_CONFIG,
  GoogleLoginProvider
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {

  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideStore({ auth: authReducer }),
    provideEffects(),

    SocialAuthService,

    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {

        autoLogin: false,
        providers: [

          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '660431609860-votnkvbouvq3sobp3ptbemtuaqk89c2m.apps.googleusercontent.com'
            )

          }
        ],
        onError: (error: any) => {
          console.error(error);
        }
      }
    }
  ]
};