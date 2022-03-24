//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

// https://stackoverflow.com/questions/35527456/angular-window-resize-event

import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HistoryService implements OnDestroy {
  history: string[] = [];
  routeSub: Subscription;

  constructor(router: Router) {
    this.routeSub = router.events
      .pipe(
        filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd)
      )
      .subscribe((e) => this.pushToHistory(e.urlAfterRedirects));
  }

  pushToHistory(url: string) {
    this.history.push(url);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
