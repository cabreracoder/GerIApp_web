import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

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
    provideHttpClient(),

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