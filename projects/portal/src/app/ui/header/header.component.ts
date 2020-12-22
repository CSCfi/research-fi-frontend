// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  ElementRef,
  Inject,
  LOCALE_ID,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { TabChangeService } from '@portal.services/tab-change.service';
import { PrivacyService } from '@portal.services/privacy.service';
import { ContentDataService } from '@portal.services/content-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('start', { static: false }) start: ElementRef;
  @ViewChild('overlay', { static: false }) overlay: ElementRef;
  @ViewChildren('navLink') navLink: any;

  currentLang: string;
  lang: string;
  currentRoute: any;
  routeSub: Subscription;
  showSkipLinks: boolean;
  params: any;
  skipLinkSub: any;
  hideInputSkip: boolean;
  newPageSub: Subscription;
  firstTab: boolean;
  consentStatusSub: Subscription;
  consent: string;
  pageDataSub: Subscription;

  navItems = [
    { label: $localize`:@@headerLink1:Etusivu`, link: '/' },
    { label: $localize`:@@headerLink2:Haku`, link: '/results/' },
    {
      label: $localize`:@@headerLink3:Tiede- ja innovaatiopolitiikka`,
      link: '/science-innovation-policy/',
      dropdownItems: [
        {
          label: $localize`:@@headerLink4:Tutkimus- ja innovaatiojärjestelmä`,
          link: '/science-innovation-policy/research-innovation-system/',
        },
        {
          label: $localize`:@@headerLink5:Tiede ja tutkimus lukuina`,
          link: '/science-innovation-policy/science-research-figures/',
        },
      ],
    },
    {
      label: $localize`:@@headerLink6:Tiede- ja tutkimusuutiset`,
      link: '/news',
    },
  ];

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private cds: ContentDataService,
    private route: ActivatedRoute,
    private tabChangeService: TabChangeService,
    private privacyService: PrivacyService
  ) {
    this.lang = localeId;
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
      // Check if consent has been chosen & set variable. This is used in linking between language versions
      if (isPlatformBrowser(this.platformId)) {
        if (localStorage.getItem('cookieConsent')) {
          this.consent = localStorage.getItem('cookieConsent');
        }
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Get page data
      if (!this.cds.pageDataFlag) {
        this.pageDataSub = this.cds.getPages().subscribe((data) => {
          this.cds.setPageData(data);
        });
      }

      this.newPageSub = this.tabChangeService.newPage.subscribe((_) => {
        this.firstTab = true;
        this.document.activeElement.blur();
      });
    }

    // Subscribe to consent status and set consent. This is also used in linking between language versions
    this.consentStatusSub = this.privacyService.currentConsentStatus.subscribe(
      (status) => {
        if (status.length) {
          this.consent = status;
        }
      }
    );

    this.skipLinkSub = this.tabChangeService.currentSkipToInput.subscribe(
      (elem) => {
        this.hideInputSkip = elem;
      }
    );
  }

  @HostListener('document:keydown.tab', ['$event'])
  // Toggle between viewing and hiding focused element outlines
  handleTabPressed = (e: any): void => {
    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem('cookieConsent');
      if (e.keyCode === 9 && consent) {
        if (this.firstTab) {
          this.firstTab = false;
          e.preventDefault();
          this.focusStart();
        }
        this.document.body.classList.add('user-tabbing');
      } else if (e.keyCode === 9) {
        if (this.firstTab) {
          this.firstTab = false;
          e.preventDefault();
          this.tabChangeService.targetFocus('consent');
        }
        this.document.body.classList.add('user-tabbing');
      }
    }
  }

  @HostListener('document:mousedown', ['$event'])
  handleMouseDown = (): void => {
    this.firstTab = false;
    this.document.body.classList.remove('user-tabbing');
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.newPageSub?.unsubscribe();
    this.consentStatusSub?.unsubscribe();
  }

  focusStart() {
    this.start.nativeElement.focus();
  }

  changeFocus(target) {
    this.tabChangeService.targetFocus(target);
  }
}
