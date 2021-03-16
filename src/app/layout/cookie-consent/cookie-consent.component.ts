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
  PLATFORM_ID,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PrivacyService } from 'src/app/portal/services/privacy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss'],
})
export class CookieConsentComponent implements OnInit, OnDestroy {
  showConsent = true;
  utilitySub: any;
  @ViewChild('readMore') readMore: ElementRef;
  focusSub: any;
  routeSub: any;

  constructor(
    private privacyService: PrivacyService,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private snackBar: MatSnackBar,
    private tabChangeService: TabChangeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Bar can be hidden from privacy / cookies tab
    this.utilitySub = this.privacyService.currentConsentBarStatus.subscribe(
      (status) => {
        this.showConsent = status === false ? true : false;
      }
    );
    // set consent bar status, this is used to set focus into consent bar
    this.privacyService.hideConsentBar(this.showConsent);
    // Load initial matomo script
    this.loadScript();
    // Get consent status from local storage and set visibility
    if (isPlatformBrowser(this.platformId)) {
      this.showConsent =
        localStorage.getItem('cookieConsent') === 'declined' ||
        localStorage.getItem('cookieConsent') === 'approved'
          ? false
          : true;
    }

    // Set consent if navigated with consent param
    if (isPlatformBrowser(this.platformId)) {
      this.routeSub = this.route.queryParams.subscribe((params) => {
        if (!localStorage.getItem('cookieConsent')) {
          switch (params.consent) {
            case 'declined': {
              this.decline(true);
              break;
            }
            case 'approved': {
              this.approve(true);
              break;
            }
          }
        }
      });
    }

    // Focus on bar instead of skip links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (focus) => {
        if (focus === 'consent') {
          this.readMore.nativeElement.focus();
        }
      }
    );
  }

  decline(showSnackBar) {
    // Hide bar and set opt out + forget consent cookies
    this.showConsent = false;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'declined');
      const node = this.document.createElement('script');
      node.type = 'text/javascript';
      node.innerHTML = `var _paq = window._paq || [];
      _paq.push(['optUserOut']);
      _paq.push(['forgetConsentGiven']);
      `;
      this.document.getElementsByTagName('head')[0].appendChild(node);
    }
    if (!showSnackBar) {
      this.snackBar.open($localize`:@@cookiesDenied:Evästeet hylätty`);
    }
  }

  approve(hideSnackBar) {
    // Hide bar and set consent
    this.showConsent = false;
    this.privacyService.changeConsentStatus('approved');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'approved');
      const node = this.document.createElement('script');
      node.id = 'matomo-consent';
      node.type = 'text/javascript';
      node.innerHTML = `var _paq = window._paq || [];
      _paq.push(['rememberConsentGiven']);
      `;
      this.document.getElementsByTagName('head')[0].appendChild(node);
      // this.setTwitterCookie();
    }
    if (!hideSnackBar) {
      this.snackBar.open($localize`:@@cookiesApproved:Evästeet hyväksytty`);
    }
  }

  setTwitterCookie() {
    const node = this.document.createElement('script');
    node.id = 'twitter-cookie';
    node.async = true;
    node.src = 'https://platform.twitter.com/widgets.js';
    node.charset = 'utf-8';
    this.document.getElementsByTagName('head')[0].appendChild(node);
  }

  public loadScript() {
    const node = this.document.createElement('script');
    node.id = 'matomo';
    node.type = 'text/javascript';
    node.innerHTML = `var _paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['requireConsent']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="https://rihmatomo-analytics.csc.fi/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '1']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();`;
    this.document.getElementsByTagName('head')[0].appendChild(node);
  }

  ngOnDestroy() {
    this.utilitySub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}
