// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterEvent,
  NavigationStart,
  NavigationEnd,
} from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})

/*
  We want to show loading indicator before data is resolved from CMS
  amd when user initializes authorization process.
*/
export class LayoutComponent implements OnInit {
  loading: boolean;
  showDivider: boolean;

  constructor(private router: Router) {}

  ngOnInit() {
    this.routerEvents();

    // Flag for rendering banner divider in MyData routes
    this.router.events.pipe(take(1)).subscribe((e) => {
      if (e instanceof NavigationStart) {
        if (e.url.includes('/mydata')) {
          this.showDivider = true;
        }
      }
    });
  }

  routerEvents() {
    this.router.events.subscribe((event: RouterEvent) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }
        case event instanceof NavigationEnd: {
          this.loading = false;
          break;
        }
      }
    });
  }
}
