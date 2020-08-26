//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrivacyService {
  private consentBarSource = new BehaviorSubject(false);
  currentConsentBarStatus = this.consentBarSource.asObservable();
  private consentStatusSource = new BehaviorSubject('');
  currentConsentStatus = this.consentStatusSource.asObservable();

  constructor() { }

  hideConsentBar(status) {
    this.consentBarSource.next(status);
  }

  changeConsentStatus(status) {
    this.consentStatusSource.next(status);
  }
}
