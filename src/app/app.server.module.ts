import { NgModule } from '@angular/core';
import {
  ServerModule,
  ServerTransferStateModule,
} from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UniversalInterceptor } from './universal-interceptor';

import { registerLocaleData } from '@angular/common';
import localeFi from '@angular/common/locales/fi';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localeFi, localeEn);

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ModuleMapLoaderModule,
    ServerTransferStateModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UniversalInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
