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
  ViewChildren,
  ElementRef,
  OnDestroy,
  Inject,
  LOCALE_ID,
  PLATFORM_ID,
  Renderer2,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';
import { DOCUMENT, PlatformLocation } from '@angular/common';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { Observable, Subscription } from 'rxjs';
import { WINDOW } from 'src/app/shared/services/window.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/app/shared/services/utility.service';
import {
  faChevronDown,
  faChevronUp,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { PrivacyService } from 'src/app/portal/services/privacy.service';
import { CMSContentService } from '@shared/services/cms-content.service';
import { AppSettingsService } from 'src/app/shared/services/app-settings.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';

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
  @ViewChild('authExpiredTemplate', { static: true })
  authExpiredTemplate: ElementRef;
  @ViewChildren('navLink') navLink: any;

  navbarOpen = false;
  hideOverflow = true;
  dropdownOpen: any;
  maxWidth = 992;
  mobile = this.window.innerWidth < this.maxWidth;

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

  consentStatusSub: Subscription;
  consent: string;
  pageDataSub: Subscription;

  appSettings: any;
  isAuthenticated: Observable<boolean>;
  loggedIn: boolean;

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle: any;
  dialogActions = [{ label: 'Sulje', primary: true, method: 'close' }];

  constructor(
    private resizeService: ResizeService,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private platform: PlatformLocation,
    private utilityService: UtilityService,
    private cmsContentService: CMSContentService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private tabChangeService: TabChangeService,
    private privacyService: PrivacyService,
    private appSettingsService: AppSettingsService,
    private oidcSecurityService: OidcSecurityService
  ) {
    this.lang = localeId;
    this.currentLang = this.getLang(this.lang);
    this.routeEvent(router);
    this.widthFlag = false;
    this.isAuthenticated = this.oidcSecurityService.isAuthenticated$;
  }

  /*
   * Current route based features
   * MyData -module uses authentication and this process needs to start only in '/mydata' routes
   */
  routeEvent(router: Router) {
    this.routeSub = router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        if (isPlatformBrowser(this.platformId)) {
          // Prevent MyData routes in production
          const allowedHostIdentifiers = ['localhost', 'test', 'qa', 'mydata'];
          const checkHostMatch = (host: string) =>
            this.platform.hostname.includes(host);

          if (
            !allowedHostIdentifiers.some(checkHostMatch) &&
            e.url.includes('/mydata')
          ) {
            this.router.navigate(['/']);
          }

          // Check if consent has been chosen & set variable. This is used in preserving consent status between language versions
          if (localStorage.getItem('cookieConsent')) {
            this.consent = localStorage.getItem('cookieConsent');
          }
        }

        // Set tracking cookies according to consent parameter
        this.route.queryParams.subscribe((params) => {
          this.params = params;

          // Set Matomo opt-out cookie if user has choosen to opt-out in another locale
          if (params.consent) {
            if (
              params.consent === 'declined' &&
              isPlatformBrowser(this.platformId)
            ) {
              localStorage.setItem('cookieConsent', 'declined');
              const node = this.document.createElement('script');
              node.type = 'text/javascript';
              node.innerHTML = `var _paq = window._paq || [];
                _paq.push(['optUserOut']);
                _paq.push(['forgetConsentGiven']);
                `;
              this.document.getElementsByTagName('head')[0].appendChild(node);
            }

            // Consent parameter is removed from url when user navigates between localized versions
            this.router.navigate([], {
              queryParams: {
                consent: null,
              },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        });

        // Prevent multiple anchors
        this.currentRoute = e.urlAfterRedirects.split('#')[0];

        // Set header items based on base url
        this.appSettings = this.currentRoute.includes('/mydata')
          ? this.appSettingsService.myDataSettings
          : this.appSettingsService.portalSettings;

        // Set current app and app settings
        if (this.currentRoute.includes('/mydata')) {
          this.appSettingsService.setCurrentAppSettings('myData');
        } else {
          this.appSettingsService.setCurrentAppSettings('portal');
        }

        // Login / logout link
        // Click functionality is handled in handleClick method
        this.isAuthenticated.subscribe((authenticated) => {
          if (this.currentRoute.includes('/mydata')) {
            this.loggedIn = authenticated;
          }
          this.appSettingsService.myDataSettings.navItems[0].label =
            authenticated ? 'Kirjaudu ulos' : 'Kirjaudu sisään';
        });
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Set mobile status
      this.appSettingsService.updateMobileStatus(this.mobile);

      // Get page data from API and set to localStorage. This data is used to generate content on certain pages
      if (!this.cmsContentService.pageDataFlag) {
        this.pageDataSub = this.cmsContentService
          .getPages()
          .subscribe((data) => {
            this.cmsContentService.setPageData(data);
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
      // this.toggleNavbar();
      // setTimeout(() => {
      //   this.navbarToggler.nativeElement.focus();
      // }, 1);
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
      this.document.body.classList.add('modal-open');
      setTimeout(() => {
        this.overlay &&
          this.renderer.setStyle(this.overlay?.nativeElement, 'top', '350px');
      }, 500);
    } else {
      this.document.body.classList.remove('modal-open');
    }

    // Allow menu to slide out before hiding
    setTimeout(() => {
      this.hideOverflow = !this.hideOverflow;
    }, 250 * (1 - +this.navbarOpen));
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

  handleLinkClick(item) {
    if (this.navbarOpen) this.toggleNavbar();

    if (item.loginProcess) {
      this.loggedIn
        ? this.oidcSecurityService.logoff()
        : this.oidcSecurityService.authorize();
    }
  }

  onResize(dims) {
    this.height = dims.height;
    this.width = dims.width;
    if (this.width >= this.maxWidth) {
      this.appSettingsService.updateMobileStatus(false);
      this.mobile = false;
      if (this.navbarOpen) {
        this.toggleNavbar();
      }

      if (this.mainNavbar) this.mainNavbar.nativeElement.style.cssText = '';
    } else {
      this.appSettingsService.updateMobileStatus(true);
      this.mobile = true;
    }
  }

  onClickedOutside(e: Event) {
    this.dropdownOpen = false;
  }

  changeFocus(target) {
    this.tabChangeService.targetFocus(target);
  }

  openDialog(title, template) {
    this.dialogTitle = title;
    this.showDialog = true;
    this.dialogTemplate = template;
  }

  doDialogAction() {
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
  }

  login() {
    this.oidcSecurityService.authorize();
  }
}
