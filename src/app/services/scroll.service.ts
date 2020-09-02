//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, EventEmitter } from '@angular/core';
import { EventManager } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  public onScroll = new EventEmitter<{x: number; y: number}>();

  private getScroll = (e: any): void => {
    if (e.path) {
      this.onScroll.emit({
        x: e.path[1].scrollX,
        y: e.path[1].scrollY,
      });
    }
  }

  constructor(eventManager: EventManager) {
    eventManager.addGlobalEventListener('window', 'scroll', this.getScroll);
  }
}

