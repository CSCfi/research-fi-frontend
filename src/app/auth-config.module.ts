//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
  AuthModule,
  StsConfigHttpLoader,
  StsConfigLoader,
} from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';

export function httpLoaderFactory(httpClient: HttpClient) {
  const config$ = httpClient.get<any>(`assets/config/auth_config.json`).pipe(
    map((customConfig) => {
      return {
        authority: customConfig.stsServer,
        historyCleanupOff: false,
        ...customConfig,
      };
    })
  );

  return new StsConfigHttpLoader(config$);
}

@NgModule({
  imports: [
    AuthModule.forRoot({
      loader: {
        provide: StsConfigLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [AuthModule],
})
export class AuthConfigModule {}
