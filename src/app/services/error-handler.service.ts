import { Injectable, ErrorHandler } from '@angular/core';
import { LoggerService } from './logger.service';
//import { ApmErrorHandler } from '@elastic/apm-rum-angular'

@Injectable({
  providedIn: 'root'
})

//export class ErrorHandlerService extends ApmErrorHandler {
export class ErrorHandlerService extends ErrorHandler {
  constructor(private logger: LoggerService) {
    super();
  }

  handleError(error) {
    this.logger.log(error);
    super.handleError(error);
  }
}
