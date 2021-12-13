import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpErrorResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

/*
 * Error handling is disabled with 'mydata' routes since this fires false error handlers
 */
export class InterceptService implements HttpInterceptor {
  constructor(
    private errorService: ErrorHandlerService,
    private router: Router
  ) {}

  handleError(error: HttpErrorResponse) {
    this.errorService.updateError(error);

    // Ingnore errors for CMS service
    console.log(error);
    if (error.url.includes('cms')) {
      return of(false);
    }

    return throwError(error);

    // if (!this.router.url.includes('mydata')) {
    //   this.errorService.updateError(error);
    //   return throwError(error);
    // }
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
