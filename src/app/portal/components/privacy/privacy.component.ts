//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
} from '@angular/core';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PrivacyService } from 'src/app/portal/services/privacy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { WINDOW } from 'src/app/shared/services/window.service';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit, AfterViewInit, OnDestroy {
  focusSub: Subscription;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  title: string;
  locale: string;
  matomoUrl: string;
  consentStatus: string;
  consentStatusSub: any;
  routeSub: Subscription;
  selectedIndex: any;
  currentLocale: string;

  private metaTags = MetaTags.privacy;
  private commonTags = MetaTags.common;

  privacyPolicyContent: any[];
  cookiePolicyContent: any[];
  userStatisticsContent: any[];

  constructor(
    private titleService: Title,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private privacyService: PrivacyService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private utilityService: UtilityService,
    @Inject(WINDOW) private window: Window,
    private appSettingsService: AppSettingsService
  ) {
    this.locale = localeId;
    this.currentLocale = this.appSettingsService.capitalizedLocale;
    this.matomoUrl =
      'https://rihmatomo-analytics.csc.fi/index.php?module=CoreAdminHome&action=optOut&language=' +
      this.locale +
      '&backgroundColor=&fontColor=&fontSize=&fontFamily=Roboto, sans-serif';
  }

  ngOnInit(): void {
    // Get page data. Data is passed with resolver in router
    const pageData = this.route.snapshot.data.pages;
    this.privacyPolicyContent = pageData.find(
      (el) => el.id === 'privacy-statement'
    );
    this.cookiePolicyContent = pageData.find((el) => el.id === 'cookie-policy');

    this.userStatisticsContent = pageData.find(
      (el) => el.id === 'user-statistics'
    );

    // Open tab
    this.routeSub = this.route.params.subscribe((param) => {
      this.selectedIndex = param.tab || 0;
    });

    this.utilityService.addMeta(
      this.metaTags['title' + this.currentLocale],
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );

    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tietosuoja - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Privacy - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle(
          'Dataskydd och behandling av personuppgifter - Forskning.fi'
        );
        break;
      }
    }
    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);

    this.title = this.getTitle();

    // Get consent status
    if (isPlatformBrowser(this.platformId)) {
      this.consentStatusSub =
        this.privacyService.currentConsentStatus.subscribe((status) => {
          this.consentStatus = localStorage.getItem('cookieConsent')
            ? localStorage.getItem('cookieConsent')
            : status;
        });
    }
  }

  changeConsent(status) {
    switch (status) {
      case 'declined': {
        this.decline();
        break;
      }
      default: {
        this.approve();
      }
    }
    this.privacyService.hideConsentBar(true);
    this.privacyService.changeConsentStatus(status);
  }

  // Add params. Enables linking to tab
  navigate(event) {
    this.router.navigate(['privacy', event.index]);
  }

  decline() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'declined');
      const node = this.document.createElement('script');
      node.type = 'text/javascript';
      node.innerHTML = `var _paq = window._paq || [];
      _paq.push(['optUserOut']);
      `;
      this.document.getElementsByTagName('head')[0].appendChild(node);
      this.document.getElementById('twitter-cookie')?.remove();
      this.window.location.reload();
    }
    this.snackBar.open($localize`:@@cookiesDenied:Evästeet hylätty`);
  }

  approve() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'approved');
      const node = this.document.createElement('script');
      node.id = 'matomo-consent';
      node.type = 'text/javascript';
      node.innerHTML = `var _paq = window._paq || [];
      _paq.push(['forgetUserOptOut']);
      `;
      this.document.getElementsByTagName('head')[0].appendChild(node);
      this.window.location.reload();
    }
    this.snackBar.open($localize`:@@cookiesApproved:Evästeet hyväksytty`);
  }

  // Not in use, will leave if needed in future
  setTwitterCookie() {
    const node = this.document.createElement('script');
    node.id = 'twitter-cookie';
    node.async = true;
    node.src = 'https://platform.twitter.com/widgets.js';
    node.charset = 'utf-8';
    this.document.getElementsByTagName('head')[0].appendChild(node);
  }

  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  getTitle() {
    return this.titleService.getTitle().split('-').shift().trim();
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.mainFocus.nativeElement.focus();
        }
      }
    );
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
    this.consentStatusSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}
