// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
} from '@angular/core';
import { AppConfigService } from '../../shared/services/app-config-service.service';
import {
  faTwitter,
  faFacebook,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { WINDOW } from '@shared/services/window.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FooterComponent implements OnInit {
  buildInfo = '';
  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faLinkedin = faLinkedin;
  okmUrl: string;
  locale: string;

  faTimes = faTimes;
  showReviewButton: boolean;

  myDataBeta: boolean;

  @ViewChild('contact') contact: ElementRef;

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle = $localize`:@@leaveReviewHeader:Anna palautetta tai kysy`;
  dialogActions: any[];
  basicDialogActions = [];

  constructor(
    private appConfigService: AppConfigService,
    @Inject(LOCALE_ID) protected localeId: string,
    private appSettingsService: AppSettingsService,
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.buildInfo = this.appConfigService.buildInfo;
    this.showReviewButton = true;
    this.locale = this.localeId;
  }

  ngOnInit() {
    this.translateContent();
    this.obfuscate();

    // Get current app settings
    this.appSettingsService.appSettings.subscribe((res) => {
      if (res.appName === 'myData') this.myDataBeta = true;
    });
  }

  translateContent() {
    switch (this.localeId) {
      case 'fi': {
        this.okmUrl = 'https://www.minedu.fi';
        break;
      }
      case 'en': {
        this.okmUrl = 'https://minedu.fi/en/';
        break;
      }
      case 'sv': {
        this.okmUrl = 'https://minedu.fi/sv/';
        break;
      }
    }
  }

  // Review button
  close() {
    this.showReviewButton = false;
  }

  openDialog(template) {
    if (!this.myDataBeta) {
      this.showDialog = true;
      this.dialogTemplate = template;
    } else {
      if (isPlatformBrowser(this.platformId)) {
        this.window.open(
          'https://link.webropolsurveys.com/S/147262C4AB44ADC3',
          '_blank'
        );
      }
    }
  }

  closeDialog() {
    this.showDialog = false;
  }

  // Email obfuscator
  obfuscate() {
    const coded = 'vr7I7CyvMv0rJM9@191.ir';
    const key =
      'm1z6dWNO04fnVsKES5aoLxJeqTIbhugFiQp9GXjtycBUZ7YwkR2M38rAlDHPCv';
    const shift = coded.length;
    let link = '';

    for (let i = 0; i < coded.length; i++) {
      if (key.indexOf(coded.charAt(i)) == -1) {
        const ltr = coded.charAt(i);
        link += ltr;
      } else {
        const ltr =
          (key.indexOf(coded.charAt(i)) - shift + key.length) % key.length;
        link += key.charAt(ltr);
      }
    }
    return link;
  }

  getMail() {
    const link = this.obfuscate();
    this.contact.nativeElement.innerHTML = link;
    this.contact.nativeElement.href = 'mailto:' + link;
  }
}
