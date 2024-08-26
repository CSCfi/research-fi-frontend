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
import { FooterComponent } from './footer/footer.component';
import { BannerDividerComponent } from '../shared/components/banner-divider/banner-divider.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { ErrorModalComponent } from './error-modal/error-modal.component';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    standalone: true,
    imports: [
        ErrorModalComponent,
        HeaderComponent,
        NgIf,
        MatProgressSpinner,
        BannerDividerComponent,
        FooterComponent,
    ],
})

/*
  We want to show loading indicator before data is resolved from CMS
  amd when user initializes authorization process.
*/
export class LayoutComponent implements OnInit {
  loading: boolean;

  constructor(private router: Router) {}

  ngOnInit() {
    this.routerEvents();
  }

  routerEvents() {
    // TODO: Angular 16 update workarounds
    // this.loading = false;
    // this.showDivider = false;

    this.router.events.subscribe((event: any) => { // TODO: Angular 16 update
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
