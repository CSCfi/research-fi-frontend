import { Injectable } from '@angular/core';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { ApmErrorHandler } from '@elastic/apm-rum-angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

// Elastic APM - https://www.elastic.co/guide/en/apm/agent/rum-js/current/angular-integration.html
export class ErrorHandlerService extends ApmErrorHandler {
  constructor(private logger: LoggerService, private router: Router) {
    super();
  }

  handleError(error) {
    setTimeout(() => {
      error.url = this.router.url;
      this.logger.log(error);
      super.handleError(error);
    }, 0);
  }
}
