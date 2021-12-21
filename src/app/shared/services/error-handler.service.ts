import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { apm } from '@elastic/apm-rum';
import { AppSettingsService } from './app-settings.service';
import * as Bowser from 'bowser';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  private errorSource = new Subject<HttpErrorResponse>();
  currentError = this.errorSource.asObservable();

  constructor(
    private logger: LoggerService,
    private router: Router,
    private appSettingsService: AppSettingsService
  ) {}

  updateError(error: HttpErrorResponse) {
    this.errorSource.next(error);
  }

  handleError(error) {
    setTimeout(async () => {
      error.orcid = this.appSettingsService.userOrcid;
      error.url = this.router.url;

      // Log browser
      if (this.appSettingsService.isBrowser) {
        const bowser = Bowser.getParser(window.navigator.userAgent);
        const browser = bowser.getBrowser;
        error.browser = browser;
      }

      console.error(error);
      this.logger.log(error);
      apm.captureError(error);
    }, 0);
  }
}
