// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, ElementRef, inject, LOCALE_ID, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppConfigService } from '../../shared/services/app-config-service.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { DialogEventsService } from '@shared/services/dialog-events.service';
// import { SharedModule } from '@shared/shared.module';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { interval, lastValueFrom, take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { ReviewComponent } from '@shared/components/review/review.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { WelcomeStepperComponent } from '@mydata/components/welcome-stepper/welcome-stepper.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { MatDialog } from '@angular/material/dialog';

function email(strings) {
  return `${strings[0]}@csc.fi`;
}

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        // SharedModule,
        AsyncPipe,
        NgIf,
        RouterLink,
        MatButtonModule,
        ReviewComponent,
        DialogComponent,
        WelcomeStepperComponent,
        SvgSpritesComponent
    ]
})
export class FooterComponent {
  locale = inject(LOCALE_ID);
  okmUrl = this.translateOkmUrl(this.locale);
  instructionsUrl = this.translateInstructionUrl(this.locale);

  interacted = false;
  email = email`tiedejatutkimus`;

  buildInfo = '';
  showReviewButton: boolean;

  // Discard changes dialog variables
  showDiscardChangesDialog: boolean;
  discardChangesDialogTitle = $localize`:@@discardChangesAndLogout:Hylkää muutokset ja kirjaudu ulos`;
  logout = $localize`:@@logout:Kirjaudu ulos`;
  discardChangesAndLogout = $localize`:@@discardChangesAndLogout:Hylkää muutokset ja kirjaudu ulos`;
  discardChangesAndLogoutActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: this.discardChangesAndLogout,
      primary: true,
      method: 'discardChangesAndLogout',
    },
  ];

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle = $localize`:@@leaveReviewHeader:Anna palautetta tai kysy`;
  dialogActions: any[];
  basicDialogActions = [];

  quickstartState$ = this.dialogEventsService.getQuickstartState();
  discardChangesModalVisible$ = this.dialogEventsService.getDiscardChangesModalVisibleState();

  constructor(
    private appConfigService: AppConfigService,
    private appSettingsService: AppSettingsService,
    private dialogEventsService: DialogEventsService,
    private router: Router,
    public discardChangesDialog: MatDialog,
  ) {
    this.buildInfo = this.appConfigService.buildInfo !== 'prod' ? this.appConfigService.buildInfo : '';
    this.showReviewButton = true;
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

  openDiscardChangesDialog() {
    this.showDiscardChangesDialog = true;
  }

  doDiscardChangesDialogAction(action: string) {
    console.log('action', action)
    this.discardChangesDialog.closeAll();
    this.dialogTitle = '';
    this.showDiscardChangesDialog = false;

    switch (action) {
      case 'discardChangesAndLogout': {
        this.dialogEventsService.discardChangesAndLogout();
        break;
      }
      default: {
        this.dialogEventsService.setDiscardChangesModalVisibleState(false);
        break;
      }
    }
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

  async openQuickstartDialog() {
    await this.router.navigate(['/mydata']);

    // Page rendering issue without additional waiting
    await lastValueFrom(interval(50).pipe(take(1)));

    this.dialogEventsService.setQuickstartState(true);
  }
}
