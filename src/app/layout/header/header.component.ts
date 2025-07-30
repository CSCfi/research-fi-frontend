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
import { DOCUMENT, PlatformLocation, NgClass, NgIf, NgFor } from '@angular/common';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { Observable, Subscription, take } from 'rxjs';
import { WINDOW } from 'src/app/shared/services/window.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { PrivacyService } from 'src/app/portal/services/privacy.service';
import { CMSContentService } from '@shared/services/cms-content.service';
import { AppSettingsService } from 'src/app/shared/services/app-settings.service';
import {
  AuthenticatedResult,
  OidcSecurityService,
} from 'angular-auth-oidc-client';
import { Constants } from '@mydata/constants';
import { DraftService } from '@mydata/services/draft.service';
import { PrimaryActionButtonComponent } from '../../shared/components/buttons/primary-action-button/primary-action-button.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { CloseButtonComponent } from '../../shared/components/buttons/close-button/close-button.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

type DomainObject = { label: string; locale: string; url: string };

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    RouterLink,
    DialogComponent,
    CloseButtonComponent,
    NgFor,
    RouterLinkActive,
    ClickOutsideDirective,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    PrimaryActionButtonComponent,
    SvgSpritesComponent
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mainNavbar', { static: true }) mainNavbar: ElementRef;
  @ViewChild('navbarToggler', { static: true }) navbarToggler: ElementRef;
  @ViewChild('overflowHider', { static: true }) overflowHider: ElementRef;
  @ViewChild('start', { static: false }) start: ElementRef;
  @ViewChild('overlay', { static: false }) overlay: ElementRef;
  @ViewChild('authExpiredTemplate', { static: true })
  authExpiredTemplate: ElementRef;
  @ViewChild('unsavedDraftTemplate', { static: true })
  unsavedDraftTemplate: ElementRef;

  @ViewChildren('navLink') navLink: any;

  navbarOpen = false;
  hideOverflow = true;
  dropdownOpen = false;
  profileToolDropdownOpen = false;
  maxWidth = 992;
  mobileNavBreakPoint = 1200;
  mobile = this.window.innerWidth < this.maxWidth;
  mobileMenu = this.window.innerWidth < this.mobileNavBreakPoint;

  height = this.window.innerHeight;
  width = this.window.innerWidth;
  private resizeSub: Subscription;

  currentDomain: DomainObject;
  lang: string;
  langMenuOpen = false;
  currentRoute: any;
  routeSub: Subscription;
  showSkipLinks: boolean;

  countTab = 0;

  navigationLinks: any[];

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
  isAuthenticated: Observable<AuthenticatedResult>;
  isAuthenticatedBool = false;
  loggedIn: boolean;

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle: any;
  dialogActions: any[];
  basicDialogActions = [
    { label: $localize`:@@close:Sulje`, primary: true, method: 'close' },
  ];

  myDataBetaTextContent: string;
  isInMydataRoute = false;

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
    public appSettingsService: AppSettingsService,
    private oidcSecurityService: OidcSecurityService,
    private draftService: DraftService
  ) {
    this.lang = localeId;
    this.routeEvent(router);
    this.widthFlag = false;
    this.isAuthenticated = this.oidcSecurityService.isAuthenticated$;
  }


  routeEvent(router: Router) {
    this.routeSub = router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        if (isPlatformBrowser(this.platformId)) {
          // Check if consent has been chosen & set variable. This is used in preserving consent status between language versions
          if (localStorage.getItem('cookieConsent')) {
            this.consent = localStorage.getItem('cookieConsent');
          }
        }
        console.log('ROUTER EVENT', e);
        if (e?.url.startsWith('/mydata')) {
          this.profileToolDropdownOpen = true;
          this.isInMydataRoute = true;
        } else {
          this.profileToolDropdownOpen = true;
          this.isInMydataRoute = false;
        }

        // Set tracking cookies according to consent parameter
        this.route.queryParams.pipe(take(1)).subscribe((params) => {
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
        this.appSettings = this.isAuthenticatedBool
          ? this.appSettingsService.portalSettingsLoggedIn
          : this.appSettingsService.portalSettings;

        this.currentDomain = this.appSettings.localizedDomains.find(
          (domain) => domain.locale === this.localeId.toUpperCase()
        );

        // Set current app and app settings
        if (this.currentRoute.includes('/mydata')) {
          this.appSettingsService.setCurrentAppSettings('myData');
        } else {
          this.appSettingsService.setCurrentAppSettings('portal');
        }

        // MYDATA DEMO: Redirect all other than mydata routes to mydata during myData beta
        if (
          isPlatformBrowser(this.platformId) &&
          this.window.location.href.includes('researchfi-mydata.rahtiapp.fi')
        ) {
          if (!this.currentRoute.includes('/mydata')) {
            this.router.navigate(['/mydata']);
          }
        }

        const navItems = this.appSettings.navItems;

        this.navigationLinks = navItems;

        // Login / logout link
        // Click functionality is handled in handleClick method
        this.isAuthenticated.pipe(take(1)).subscribe((authenticated) => {
          const isAuthenticated = authenticated.isAuthenticated;
          this.isAuthenticatedBool = authenticated.isAuthenticated;
          console.log('isAuthenticated', isAuthenticated);



          if (this.currentRoute.includes('/mydata') && this.currentRoute !== '/mydata') {
            this.loggedIn = isAuthenticated;
            if (!isAuthenticated) {
              this.router.navigate(['/mydata']);
            }
            /*            // Hide navigation links other than login if user hasn't authenticated
                        this.navigationLinks = isAuthenticated
                          ? navItems
                          : navItems.filter((item) => item.loginProcess);

                        navItems.find((item) => item.loginProcess).label = isAuthenticated
                          ? $localize`:@@logout:Kirjaudu ulos`
                          : $localize`:@@logIn:Kirjaudu sisään`;
                      */
          }
        });
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Set mobile status
      this.appSettingsService.updateMobileStatus(this.mobile);

      // Get page data from API and set to localStorage. This data is used to generate content on certain pages
      if (!this.cmsContentService.pageDataLoaded) {
        this.cmsContentService
          .getPages()
          .pipe(take(1))
          .subscribe((data) => {
            this.cmsContentService.setPageData(data);
          });
      }
      this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
        this.onResize(dims)
      );
      this.newPageSub = this.tabChangeService.newPage.subscribe((_) => {
        // Blur page for tab accessibility to focus on header skip links
        this.firstTab = true;
        this.document.activeElement.blur();
      });

      // Set banners visible when page loaded/refreshed
      sessionStorage.setItem('researchersLoginSnackbarVisible','true');
      sessionStorage.setItem('projectInfoBannerVisible','true');
      sessionStorage.setItem('betaSearchBannerVisible','true');
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
    this.skipLinkSub?.unsubscribe();
  }

  focusStart() {
    this.start.nativeElement.focus();
  }

  toggleNavbar() {
    // Toggle navbar state
    this.navbarOpen = !this.navbarOpen;
    this.profileToolDropdownOpen = this.isInMydataRoute;

    // Set the overlay lower so skip links dont mess up overlay
    if (this.navbarOpen) {
      this.document.body.classList.add('menu-open');
/*      setTimeout(() => {
        this.overlay &&
        this.renderer.setStyle(this.overlay?.nativeElement, 'top', '350px');
      }, 500);*/
    } else {
      this.document.body.classList.remove('menu-open');
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

  changeLang(domain: DomainObject) {
    this.currentDomain = domain;
    this.document.location.href =
      domain.url +
      this.currentRoute +
      (this.consent ? '?consent=' + this.consent : '');
  }

  handleLinkClick(item) {
    if (this.navbarOpen) this.toggleNavbar();

    if (item.loginProcess) {
      this.loggedIn
        ? this.handleMyDataLogoff()
        : this.oidcSecurityService.authorize();
    }
  }

  handleMyDataLogoff() {
    if (isPlatformBrowser(this.platformId)) {
      if (
        sessionStorage.getItem(Constants.draftPatchPayload) ||
        sessionStorage.getItem(Constants.draftPublicationPatchPayload)
      ) {
        const logoutDialogActions = [
          {
            label: $localize`:@@logout:Kirjaudu ulos`,
            primary: true,
            method: 'logout',
          },
          {
            label: $localize`:@@cancel:Peruuta`,
            method: 'close',
          },
        ];

        this.openDialog(
          'Kirjaudu ulos',
          this.unsavedDraftTemplate,
          logoutDialogActions
        );
      } else {
        this.oidcSecurityService.logoff();
      }
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

    this.width >= this.mobileNavBreakPoint
      ? (this.mobileMenu = false)
      : (this.mobileMenu = true);
  }

  onClickedOutside(e: Event) {
    // this.dropdownOpen = false;
  }

  changeFocus(target) {
    this.tabChangeService.targetFocus(target);
  }

  openDialog(title, template, actions) {
    // Set text content for MyData beta
    // Note: Data isn't available through resolver in layout module
    this.cmsContentService.pageData.pipe(take(1)).subscribe((data) => {
      this.myDataBetaTextContent = data.find(
        (item) => item.id === 'mydata_beta_text'
      )['content' + this.appSettingsService.capitalizedLocale];
    });

    this.dialogTitle = title;
    this.showDialog = true;
    this.dialogTemplate = template;
    this.dialogActions = actions;
  }

  doDialogAction(action: string) {
    if (action === 'logout') {
      this.oidcSecurityService.logoff();
      this.draftService.clearData();
    }

    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
  }

  login() {
    this.oidcSecurityService.authorize();
  }

  // Alert user if draft data in session storage
  @HostListener('window:beforeunload', ['$event'])
  public checkForDraftData() {
    if (
      !this.appSettingsService.myDataSettings.debug &&
      this.currentRoute.includes('/mydata/profile') &&
      (sessionStorage.getItem(Constants.draftPatchPayload) ||
        sessionStorage.getItem(Constants.draftPublicationPatchPayload))
    )
      return false;
  }
}
