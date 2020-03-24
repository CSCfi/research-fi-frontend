// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AppConfigService } from '../../services/app-config-service.service';
import { faTwitter, faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {
  buildInfo = '';
  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faLinkedin = faLinkedin;
  okmUrl: string;

  constructor(private appConfigService: AppConfigService, @Inject(LOCALE_ID) protected localeId: string) {
    this.buildInfo = this.appConfigService.buildInfo;
  }

  ngOnInit() {
    this.translateContent();
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

}
