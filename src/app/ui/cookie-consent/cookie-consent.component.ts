//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent implements OnInit, OnDestroy {
  showConsent = true;
  utilitySub: any;

  constructor(private utilityService: UtilityService, @Inject(DOCUMENT) private document: any,
              @Inject(PLATFORM_ID) private platformId: object) { }

  ngOnInit(): void {
    // Bar can be hidden from privacy / cookies tab
    this.utilitySub = this.utilityService.currentConsentBarStatus.subscribe(status => {
      this.showConsent = status === false ? true : false;
    });
    // set consent bar status, this is used to set focus into consent bar
    this.utilityService.hideConsentBar(this.showConsent);
    // Load initial matomo script
    this.loadScript();
    // Get consent status from local storage and set visibility
    if (isPlatformBrowser(this.platformId)) {
      this.showConsent = localStorage.getItem('cookieConsent') === 'declined' ||
      localStorage.getItem('cookieConsent') === 'approved' ? false : true;
    }
  }

  decline() {
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
  }

  approve() {
    // Hide bar and set consent
    this.showConsent = false;
    this.utilityService.changeConsentStatus('approved');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'approved');
      const node = this.document.createElement('script');
      node.id = 'matomo-consent';
      node.type = 'text/javascript';
      node.innerHTML = `var _paq = window._paq || [];
      _paq.push(['rememberConsentGiven']);
      `;
      this.document.getElementsByTagName('head')[0].appendChild(node);
    }
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
  }

}
