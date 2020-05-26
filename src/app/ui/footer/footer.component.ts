// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit, Inject, LOCALE_ID, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AppConfigService } from '../../services/app-config-service.service';
import { faTwitter, faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReviewComponent } from '../review/review.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FooterComponent implements OnInit {
  buildInfo = '';
  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faLinkedin = faLinkedin;
  okmUrl: string;

  faTimes = faTimes;
  showReviewButton: boolean;
  betaReviewDialogRef: MatDialogRef<ReviewComponent>;

  constructor(private appConfigService: AppConfigService, @Inject(LOCALE_ID) protected localeId: string, public dialog: MatDialog) {
    this.buildInfo = this.appConfigService.buildInfo;
    this.showReviewButton = true;
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

    // Review button
    close() {
      this.showReviewButton = false;
    }

    toggleReview() {
      this.betaReviewDialogRef = this.dialog.open(ReviewComponent, {
        maxWidth: '800px',
        minWidth: '320px',
        minHeight: '60vh'
      });
    }

}
