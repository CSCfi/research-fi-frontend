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
  AfterViewInit,
  ChangeDetectorRef,
  Renderer2,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ResizeService } from '../../services/resize.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/app/services/utility.service';
import {
  faChevronDown,
  faChevronUp,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BetaInfoComponent } from '../beta-info/beta-info.component';
import { PrivacyService } from 'src/app/services/privacy.service';
import { ContentDataService } from 'src/app/services/content-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
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
      // Get page data from API and set to localStorage. This data is used to generate content on certain pages
      if (!this.cds.pageDataFlag) {
        this.pageDataSub = this.cds.getPages().subscribe((data) => {
          this.cds.setPageData(data);
          // sessionStorage.setItem('pageData', JSON.stringify(data));
        });
      }
      // this.window.addEventListener('keydown', this.handleTabPressed);
      // this.window.addEventListener('mousedown', this.handleMouseDown);
      // this.window.addEventListener('keydown', this.escapeListener);
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
  };

  @HostListener('document:mousedown', ['$event'])
  handleMouseDown = (): void => {
    this.firstTab = false;
    this.document.body.classList.remove('user-tabbing');
  };

  ngAfterViewInit() {
    // if (!this.mobile) {
    //   const widths = this.navLink.map(th => th.nativeElement.offsetWidth + this.additionalWidth);
    //   this.navLink.forEach((item, index) => {
    //     this.renderer.setStyle(
    //       item.nativeElement,
    //       'width',
    //       `${widths[index]}px`
    //     );
    //   });
    //   this.widthFlag = true;
    // }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      // this.window.removeEventListener('keydown', this.handleTabPressed);
      // this.window.removeEventListener('keydown', this.escapeListener);
      // this.window.removeEventListener('mousedown', this.handleMouseDown);

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
    let current = '';
    switch (lang) {
      case 'fi': {
        current = 'FI';
        break;
      }
      case 'sv': {
        current = 'SV';
        break;
      }
      case 'en': {
        current = 'EN';
        break;
      }
    }
    this.document.documentElement.lang = lang;
    return current;
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

    // if (!this.mobile && !this.widthFlag) {
    //   setTimeout(x => {
    //     const widths = this.navLink.map(th => th.nativeElement.offsetWidth + this.additionalWidth);
    //     const arr = this.navLink.toArray();
    //     arr.forEach((item, index) => {
    //       this.renderer.setStyle(
    //         item.nativeElement,
    //         'width',
    //         `${widths[index]}px`
    //       );
    //     });
    //   }, 200);
    //   this.widthFlag = true;
    // }
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
