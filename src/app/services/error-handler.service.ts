import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { ApmErrorHandler } from '@elastic/apm-rum-angular'

@Injectable({
  providedIn: 'root'
})
 
// Elastic APM - https://www.elastic.co/guide/en/apm/agent/rum-js/current/angular-integration.html
export class ErrorHandlerService extends ApmErrorHandler {
  constructor(private logger: LoggerService) {
    super();
  }

  handleError(error) {
    this.logger.log(error);
    super.handleError(error);
  }
}
