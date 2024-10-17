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
  TemplateRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { combineLatest, forkJoin, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { StaticDataService } from 'src/app/portal/services/static-data.service';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { ErrorHandlerService } from '@shared/services/error-handler.service';
import { HttpErrors } from '@shared/constants';
import { CustomErrorType } from '@shared/types';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';

@Component({
    selector: 'app-error-modal',
    templateUrl: './error-modal.component.html',
    standalone: true,
    imports: [NgIf, DialogComponent],
})
export class ErrorModalComponent implements OnInit {
  @ViewChild('errorModal', { static: true }) private modal: TemplateRef<any>;
  errorSub: Subscription;
  error: CustomErrorType;
  isBrowser: boolean;
  cmsError: boolean;

  httpErrors = HttpErrors;

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle: string;
  dialogActions: any[];
  basicDialogActions = [];

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private utilityService: UtilityService,
    public staticDataService: StaticDataService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.errorSub = this.errorHandlerService.currentError.subscribe((error) => {
      // Portal can be used if CMS server is down. This needs to be
      // indicated to user and therefore we render dedicated error message
      if (error.message?.includes('cms')) this.cmsError = true;
      this.error = error;
      // Only allow a single modal to be active at a time
      if (isPlatformBrowser(this.platformId)) {
        if (!this.utilityService.modalOpen) {
          this.openModal(this.modal);
        }
      }
    });
  }

  openModal(template) {
    if (this.error.status) {
      if (this.cmsError) {
        this.dialogTitle = $localize`:@@dataFetchError:Virhe tiedon hakemisessa`;
      } else {
        const errorLabel = $localize`:@@error:Virhe`;
        this.dialogTitle = `${this.error.status} ${errorLabel}`.trim();
      }
    } else {
      this.dialogTitle = $localize`:@@error:Virhe`;
    }

    this.showDialog = true;
    this.dialogTemplate = template;
  }

  preventTab(event) {
    UtilityService.preventTab(event);
  }

  closeModal() {
    this.showDialog = false;
  }
}
