//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewEncapsulation } from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from '../../services/profile.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-welcome-stepper',
  templateUrl: './welcome-stepper.component.html',
  styleUrls: ['./welcome-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeStepperComponent {
  step = 1;
  cancel = false;
  dataFetched = false;
  termsApproved = false;
  personalDataHandlingApproved = false;
  fetching = false;
  userData: any;
  userName: string;

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  constructor(
    private profileService: ProfileService,
    private oauthService: OAuthService
  ) {
    this.getUserData();
  }

  private getUserData() {
    const jwt = this.oauthService.getIdToken();
    const tokens = jwt.split('.');
    // console.log(atob(tokens[1]));
    this.userData = JSON.parse(atob(tokens[1]));
    this.userName = this.userData?.name.split(' ')[0];
  }

  increment() {
    this.step = this.step + 1;
  }

  decrement() {
    this.step = this.step - 1;
  }

  toggleCancel() {
    this.cancel = !this.cancel;
  }

  onCancelClick(event) {
    this.toggleCancel();
  }

  fetchData() {
    this.dataFetched = true;
  }

  setDataFlag(event) {
    this.fetchData();
  }

  createProfile() {
    this.profileService.createProfile().subscribe((data) => console.log(data));
  }

  deleteProfile() {
    this.profileService.deleteProfile().subscribe((data) => console.log(data));
  }
}
