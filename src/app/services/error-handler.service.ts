import { Injectable, ErrorHandler } from '@angular/core';
import { LoggerService } from './logger.service';
//import { ApmErrorHandler } from '@elastic/apm-rum-angular'

@Injectable({
  providedIn: 'root'
})

// APM - https://www.elastic.co/guide/en/apm/agent/rum-js/current/angular-integration.html
//
// ErrorHandlerService should extend AmpErrorHandler, which takes care of sending
// error reports to the APM server. At the moment the APM JS client does not work
// properly with build target "es2015" in tsconfig.json. It would work using target "es5".
// ApmErrorHandler should be activated when the following issue is fixed:
// https://github.com/elastic/apm-agent-rum-js/issues/607

// export class ErrorHandlerService extends ApmErrorHandler {

export class ErrorHandlerService extends ErrorHandler {
  constructor(private logger: LoggerService) {
    super();
  }

  handleError(error) {
    this.logger.log(error);
    super.handleError(error);
  }
}
