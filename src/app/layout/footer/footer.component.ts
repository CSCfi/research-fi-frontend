// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, ElementRef, inject, LOCALE_ID, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppConfigService } from '../../shared/services/app-config-service.service';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { DialogEventsService } from '@shared/services/dialog-events.service';

function email(strings) {
    return `${strings[0]}@csc.fi`;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FooterComponent implements OnInit {
  locale = inject(LOCALE_ID);
  okmUrl = this.translateOkmUrl(this.locale);
  instructionsUrl = this.translateInstructionUrl(this.locale);

  interacted = false;
  email = email`tiedejatutkimus`;

  buildInfo = '';
  faTwitter = faTwitter;

  faTimes = faTimes;
  showReviewButton: boolean;

  myDataBeta: boolean;

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle = $localize`:@@leaveReviewHeader:Anna palautetta tai kysy`;
  dialogActions: any[];
  basicDialogActions = [];

  quickstartState$ = this.dialogEventsService.getQuickstartState();

  constructor(
    private appConfigService: AppConfigService,
    private appSettingsService: AppSettingsService,
    private dialogEventsService: DialogEventsService,
  ) {
    this.buildInfo = this.appConfigService.buildInfo;
    this.showReviewButton = true;
  }

  ngOnInit() {
    // Get current app settings
    this.appSettingsService.appSettings.subscribe((res) => {
      if (res.appName === 'myData') this.myDataBeta = true;
    });
  }

  translateOkmUrl(locale: string) {
    let output = 'https://www.minedu.fi';

    if (locale === 'en') {
      output = 'https://minedu.fi/en/';
    }

    if (locale === 'sv') {
      output = 'https://minedu.fi/sv/';
    }

    return output;
  }

  translateInstructionUrl(locale: string) {
    let output = 'https://wiki.eduuni.fi/x/WQgGEw';

    if (locale === 'en') {
      output = 'https://wiki.eduuni.fi/x/jAGcEw';
    }

    if (locale === 'sv') {
      output = 'https://wiki.eduuni.fi/x/dAKcEw';
    }

    return output;
  }

  // Review button
  close() {
    this.showReviewButton = false;
  }

  openDialog(template) {
    this.showDialog = true;
    this.dialogTemplate = template;
  }

  closeDialog() {
    this.showDialog = false;
  }

  setInteracted(bool: boolean) {
    this.interacted = bool;
  }

  openQuickstartDialog() {
    this.dialogEventsService.setQuickstartState(true);
  }
}
