//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {Injectable, Inject, Optional} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders} from '@angular/common/http';
import {Request} from 'express';
import {REQUEST} from '@nguniversal/express-engine/tokens';
import {EXPRESS_HTTP_PORT} from './app.global';

/*
HttpInterceptor to enable proper handling of config file 'config.json'.
Angular application requests the config file without absolute URL, because
the server URL cannot be hard coded.

HttpInterceptor will catch the request and modifies the request to contain
full server address.
*/
@Injectable()
export class UniversalInterceptor implements HttpInterceptor {

  constructor(@Optional() @Inject(REQUEST) protected request: Request) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let serverReq: HttpRequest<any> = req;
    /*
    Modify request for 'config.json'.
    Ensure full path including port number, so that the request works with Angular Universal and Docker.
    */
    if (this.request && req.url.indexOf('config.json') !== -1) {
      let configJsonUrl = `http://localhost:${EXPRESS_HTTP_PORT}/assets/config/config.json`;
      serverReq = req.clone({url: configJsonUrl});
    }
    return next.handle(serverReq);
  }
}
