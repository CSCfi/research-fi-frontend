// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  Inject,
  LOCALE_ID,
  PLATFORM_ID,
  ViewChildren,
  Renderer2,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ResizeService } from '@portal.services/resize.service';
import { Subscription } from 'rxjs';
import { WINDOW } from '@portal.services/window.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UtilityService } from '@portal.services/utility.service';
import {
  faChevronDown,
  faChevronUp,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { TabChangeService } from '@portal.services/tab-change.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BetaInfoComponent } from '../beta-info/beta-info.component';
import { PrivacyService } from '@portal.services/privacy.service';
import { ContentDataService } from '@portal.services/content-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mainNavbar', { static: true }) mainNavbar: ElementRef;
  @ViewChild('navbarToggler', { static: true }) navbarToggler: ElementRef;
  @ViewChild('overflowHider', { static: true }) overflowHider: ElementRef;
  @ViewChild('start', { static: false }) start: ElementRef;
  @ViewChild('overlay', { static: false }) overlay: ElementRef;
  @ViewChildren('navLink') navLink: any;

  navbarOpen = false;
  hideOverflow = true;
  dropdownOpen: any;
  mobile = this.window.innerWidth < 1200;

  height = this.window.innerHeight;
  width = this.window.innerWidth;
  private resizeSub: Subscription;

  currentLang: string;
  lang: string;
  currentRoute: any;
  routeSub: Subscription;
  showSkipLinks: boolean;

  countTab = 0;
  navLinkArr: any;

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faInfoCircle = faInfoCircle;

  widthFlag: boolean;

  additionalWidth = 25;
  params: any;
  skipLinkSub: any;
  hideInputSkip: boolean;
  newPageSub: Subscription;
  firstTab: boolean;

  betaReviewDialogRef: MatDialogRef<BetaInfoComponent>;
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
    private resizeService: ResizeService,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private utilityService: UtilityService,
    private cds: ContentDataService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private tabChangeService: TabChangeService,
    public dialog: MatDialog,
    private privacyService: PrivacyService
  ) {
    this.lang = localeId;
    this.currentLang = this.getLang(this.lang);
    this.routeEvent(router);
    this.widthFlag = false;
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
      this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
        this.onResize(dims)
      );
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

  @HostListener('document:keydown.escape', ['$event'])
  escapeListener(event: any) {
    if (
      this.mobile &&
      !this.utilityService.modalOpen &&
      !this.utilityService.tooltipOpen
    ) {
      this.toggleNavbar();
      setTimeout(() => {
        this.navbarToggler.nativeElement.focus();
      }, 1);
    }
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
    if (isPlatformBrowser(this.platformId)) {
      this.resizeSub?.unsubscribe();
    }
    this.routeSub?.unsubscribe();
    this.newPageSub?.unsubscribe();
    this.consentStatusSub?.unsubscribe();
  }

  focusStart() {
    this.start.nativeElement.focus();
  }

  toggleNavbar() {
    // Toggle navbar state
    this.navbarOpen = !this.navbarOpen;

    // Set the overlay lower so skip links dont mess up overlay
    if (this.navbarOpen) {
      setTimeout(() => {
        // tslint:disable-next-line: no-unused-expression
        this.overlay &&
          this.renderer.setStyle(this.overlay?.nativeElement, 'top', '350px');
      }, 500);
    }

    // Allow menu to slide out before hiding
    setTimeout(() => {
      this.hideOverflow = !this.hideOverflow;
    }, 250 * (1 - +this.navbarOpen));
  }

  // @HostListener('window:scroll')
  scroll() {
    // Doesnt work with esc opening and scrolling to focus
    if (this.navbarOpen) {
      // this.toggleNavbar();
    }
  }

  setLang(lang: string) {
    this.lang = lang;
    this.document.documentElement.lang = lang;
  }

  getLang(lang: string) {
    this.document.documentElement.lang = lang;
    return lang.toUpperCase();
  }

  onResize(dims) {
    this.height = dims.height;
    this.width = dims.width;
    if (this.width >= 1200) {
      this.mobile = false;
      if (this.navbarOpen) {
        this.toggleNavbar();
      }
      this.mainNavbar.nativeElement.style.cssText = '';
    } else {
      this.mobile = true;
    }
  }

  onClickedOutside(e: Event) {
    this.dropdownOpen = false;
  }

  changeFocus(target) {
    this.tabChangeService.targetFocus(target);
  }

  toggleBetaInfo() {
    this.betaReviewDialogRef = this.dialog.open(BetaInfoComponent, {
      height: '700px',
      maxWidth: '60vw',
      minWidth: '400px',
      autoFocus: false,
    });
  }
}
