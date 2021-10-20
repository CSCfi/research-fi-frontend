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
    }
  }
}
