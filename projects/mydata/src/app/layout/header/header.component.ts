import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  lang = 'fi';
  currentRoute: string;
  navItems = [
    { label: 'Kirjaudu sisään', link: '/login'},
  ];

  routeSub: Subscription;
  params: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.routeEvent(router);
   }

  // Get current url
  routeEvent(router: Router) {
    this.routeSub = router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        // Prevent multiple anchors
        this.route.queryParams.subscribe((params) => {
          this.params = params;
          // Remove consent param
          if (params.consent) {
            this.router.navigate([], {
              queryParams: {
                consent: null,
              },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        });
        this.currentRoute = e.urlAfterRedirects.split('#')[0];
      }
    });
  }

  ngOnInit(): void {
  }

}
