import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterEvent,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'mydata';
  loading: boolean;
  isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
    }
    this.routerEvents();
  }

  // Set loading indicator. This is useful for pages that rely on resolvers
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
