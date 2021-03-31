import { Injectable } from '@angular/core';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private logger: LoggerService, private router: Router) {}

  handleError(error) {
    setTimeout(() => {
      error.url = this.router.url;
      console.error(error);
      this.logger.log(error);
    }, 0);
  }
}
