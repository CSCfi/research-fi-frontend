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
  }

  routerEvents() {
    this.router.events.subscribe((event: any) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          this.showDivider = false;
          break;
        }
        case event instanceof NavigationEnd: {
          this.loading = false;

          // Flag for rendering banner divider in MyData routes
          if (event.url.includes('/mydata')) {
            this.showDivider = true;
          }
          break;
        }
      }
    });
  }
}
