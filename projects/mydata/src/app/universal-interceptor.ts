//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, Inject, Optional, LOCALE_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpHeaders,
  HttpEvent,
} from '@angular/common/http';
import { Request } from 'express';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { EXPRESS_HTTP_PORT } from './app.global';
import 'rxjs/add/operator/map';

/*
HttpInterceptor to enable proper handling of config file 'config.json'.
Angular application requests the config file without absolute URL, because
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
    Modify request for 'config.json'.
    Ensure full path including port number, so that the request works with Angular Universal and Docker.

    Overwrite property 'email' in response. This prevents email configuration from leaking to 'view source', because
    of Angular's Transfer State functionality https://angular.io/api/platform-browser/TransferState
    It is safe to remove 'email', because config.json will be read independently in server.ts.
    */
    if (this.request && req.url.indexOf('config.json') !== -1) {
      let configJsonUrl = `http://localhost:${EXPRESS_HTTP_PORT}/${this.localeId.slice(
        0,
        2
      )}/assets/config/config.json`;
      serverReq = req.clone({ url: configJsonUrl });

      // Overwrite property 'email' in config.json response.
      return next.handle(serverReq).map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          event.body['email'] = {};
        }
        return event;
      });
    } else {
      return next.handle(serverReq);
    }
  }
}
