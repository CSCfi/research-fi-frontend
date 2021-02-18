//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

// https://stackoverflow.com/questions/35527456/angular-window-resize-event

import { Injectable } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  history: string[] = [];

  constructor(router: Router) {
    router.events
      .pipe(
        filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd)
      )
      .subscribe((e) => this.pushToHistory(e.urlAfterRedirects));
  }

  pushToHistory(url: string) {
    this.history.push(url);
  }
}
