//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import {
  AuthModule,
  OidcConfigService,
  OidcSecurityService,
} from 'angular-auth-oidc-client';
import { map, switchMap } from 'rxjs/operators';

export function configureAuth(
  oidcConfigService: OidcConfigService,
  httpClient: HttpClient
) {
  const setupAction$ = httpClient
    .get<any>(`assets/config/auth_config.json`)
    .pipe(
      map((authConfig) => {
        return authConfig;
      }),
      switchMap((config) => oidcConfigService.withConfig(config))
    );

  return () => setupAction$.toPromise();
}

@NgModule({
  imports: [AuthModule.forRoot()],
  providers: [
    OidcSecurityService,
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService, HttpClient],
      multi: true,
    },
  ],
  exports: [AuthModule],
})
export class AuthConfigModule {}
