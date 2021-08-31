import { Injectable } from '@angular/core';

// Might be overkill but can be useful
export enum LogLevel {
  Debug = 1,
  Info = 2,
  Warning = 3,
  Error = 4,
  All = 5,
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  logLevel = LogLevel.Error;

  constructor() {}

  log(error: any, level = this.logLevel) {
    if (this.logLevel >= level) {
      console.warn('This error would be logged in the future');
    }
  }
}
