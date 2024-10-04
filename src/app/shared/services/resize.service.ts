//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

// https://stackoverflow.com/questions/35527456/angular-window-resize-event

import { Injectable, EventEmitter } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResizeService {
  public onResize$ = new BehaviorSubject<{ width: number; height: number }>({ width: undefined, height: undefined });

  updateScreenSize(width: number, height: number) {
    this.onResize$.next({width, height});
  }
}
