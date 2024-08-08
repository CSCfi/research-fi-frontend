//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT
import { inject, Injectable, makeStateKey, TransferState } from '@angular/core';

const ENV_KEY = makeStateKey<{
  cmsUrl: string,
  buildInfo: string,
  profileApiUrl: string,
  apiUrl: string,
  matomoSiteId: string
}>('env');

const defaultConfig = {
  cmsUrl: "DEFAULT DATA",
  buildInfo: "DEFAULT DATA",
  profileApiUrl: "DEFAULT DATA",
  apiUrl: "DEFAULT DATA",
  matomoSiteId: "-1"
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  transferedState = inject(TransferState);

  get apiUrl() {
    const { apiUrl } = this.transferedState.get(ENV_KEY, defaultConfig);
    return apiUrl + '/portalapi/';
  }

  get cmsUrl() {
    const { cmsUrl } = this.transferedState.get(ENV_KEY, defaultConfig);
    return cmsUrl;
  }

  get buildInfo() {
    const { buildInfo } = this.transferedState.get(ENV_KEY, defaultConfig);
    return buildInfo;
  }

  get matomoSiteId() {
    const { matomoSiteId } = this.transferedState.get(ENV_KEY, defaultConfig);
    return matomoSiteId;
  }

  get profileApiUrl() {
    const { profileApiUrl } = this.transferedState.get(ENV_KEY, defaultConfig);
    return profileApiUrl;
  }
}
