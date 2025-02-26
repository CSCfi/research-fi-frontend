import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { Router } from '@angular/router';
import { AppConfigService } from './app-config-service.service';

@Injectable({
  providedIn: 'root',
})

/*
 * Error handling is disabled with 'mydata' routes since this fires false error handlers
 */
export class InterceptService implements HttpInterceptor {
  constructor(
    private errorService: ErrorHandlerService,
    private router: Router,
    private appConfigService: AppConfigService
  ) {
    // console.log('"InterceptService" interceptor HERE!');
  }

  handleError(error: HttpErrorResponse) {
    this.errorService.updateError({ status: error.status });

    // Allow user to continue the use of application if CMS service is down.
    if (error.url.includes(this.appConfigService.cmsUrl)) {
      return of(false);
    }

    return throwError(() => error);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.router.url.includes('mydata')) {
      return next.handle(req).pipe(catchError(this.handleError.bind(this)));
    } else {
      return next.handle(req);
    }
  }
}
