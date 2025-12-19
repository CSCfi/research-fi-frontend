import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSettingsService } from './app-settings.service';
import { CustomErrorType } from '@shared/types';
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  private errorSource = new Subject<CustomErrorType>();
  currentError = this.errorSource.asObservable();

  constructor(
    private logger: LoggerService,
    private router: Router,
    private appSettingsService: AppSettingsService
  ) {}

  updateError(error: CustomErrorType) {
    this.errorSource.next(error);
  }

  handleError(error) {
    setTimeout(async () => {
      //error.orcid = this.appSettingsService.userOrcid;
      //error.url = this.router.url;

      console.error(error);
      this.logger.log(error);
    }, 0);
  }
}
