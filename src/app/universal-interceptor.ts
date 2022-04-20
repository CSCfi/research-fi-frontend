//  This file is part of the research.fi API service
//
//  Copyright 2021 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, Inject, Optional, LOCALE_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpEvent,
} from '@angular/common/http';
import { Request } from 'express';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { EXPRESS_HTTP_PORT } from './app.global';
import { map } from 'rxjs/operators';

/*
HttpInterceptor to enable proper handling of config files 'config.json' and 'auth_config.json'.
Angular application requests the config files without absolute URL, because
the server URL cannot be hard coded.

HttpInterceptor will catch the request and modifies the request to contain
full server address.
*/
@Injectable()
export class UniversalInterceptor implements HttpInterceptor {
  constructor(
    @Optional() @Inject(REQUEST) protected request: Request,
    @Inject(LOCALE_ID) protected localeId: string
  ) {
    this.localeId = localeId;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let serverReq: HttpRequest<any> = req;
    /*
    Modify requests for 'config.json' and 'auth_config.json'.
    Ensure full path including port number, so that the request works with Angular Universal and Docker.
    */
    if (this.request && req.url.indexOf('auth_config.json') !== -1) {
      let authConfigJsonUrl = `http://localhost:${EXPRESS_HTTP_PORT}/${this.localeId.slice(
        0,
        2
      )}/assets/config/auth_config.json`;
      serverReq = req.clone({ url: authConfigJsonUrl });
      return next.handle(serverReq);
    } else if (this.request && req.url.indexOf('config.json') !== -1) {
      let configJsonUrl = `http://localhost:${EXPRESS_HTTP_PORT}/${this.localeId.slice(
        0,
        2
      )}/assets/config/config.json`;
      serverReq = req.clone({ url: configJsonUrl });

      /*
      Overwrite property 'email' in config.json response. This prevents email configuration from leaking to browser's 'view source', because
      of Angular's Transfer State functionality https://angular.io/api/platform-browser/TransferState
      It is safe to remove 'email', because config.json will be read independently in server.ts.
      */
      return next.handle(serverReq).pipe(
        map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            event.body['email'] = {};
          }
          return event;
        })
      );
    } else {
      return next.handle(serverReq);
    }
  }
}
