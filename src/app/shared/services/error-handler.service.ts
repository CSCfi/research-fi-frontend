import { Injectable } from '@angular/core';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private errorSource = new Subject<HttpErrorResponse>();
  currentError = this.errorSource.asObservable();

  constructor(private logger: LoggerService) {}

  updateError(error: HttpErrorResponse) {
    this.errorSource.next(error);
  }

  handleError(error) {
    setTimeout(() => {
      console.error(error);
      this.logger.log(error);
    }, 0);
  }
}
