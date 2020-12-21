//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

// https://stackoverflow.com/questions/35527456/angular-window-resize-event

import { Injectable, EventEmitter } from '@angular/core';
import { EventManager } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ResizeService {

  public onResize$ = new EventEmitter<{width: number; height: number}>();

  private getDims = (e: any): void => {
    this.onResize$.emit({
      width: e.target.innerWidth,
      height: e.target.innerHeight
    });
  }

  constructor(eventManager: EventManager) {
    eventManager.addGlobalEventListener('window', 'resize', this.getDims);
  }
}
