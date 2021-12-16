//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Constants } from '@mydata/constants';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  draftData: any = null;

  constructor(private appSettingsService: AppSettingsService) {}

  saveDraft(data) {
    this.draftData = data;
  }

  clearData() {
    this.draftData = null;

    if (this.appSettingsService.isBrowser) {
      sessionStorage.removeItem(Constants.draftProfile);
      sessionStorage.removeItem(Constants.draftPatchPayload);
      sessionStorage.removeItem(Constants.draftPublicationPatchPayload);
      sessionStorage.removeItem(Constants.draftDatasetPatchPayload);
      sessionStorage.removeItem(Constants.draftFundingPatchPayload);
      sessionStorage.removeItem(Constants.draftCollaborationPatchPayload);
    }
  }
}
