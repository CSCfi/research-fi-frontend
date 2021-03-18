//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from '../../services/profile.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-welcome-stepper',
  templateUrl: './welcome-stepper.component.html',
  styleUrls: ['./welcome-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeStepperComponent implements OnInit {
  step = 1;
  cancel = false;
  dataFetched = false;
  termsApproved = false;
  personalDataHandlingApproved = false;
  fetching = false;

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  firstName: string;
  editorData: Object;

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService
  ) {
    this.editorData = null;
  }

  ngOnInit() {
    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      this.firstName = data.name.split(' ')[0];
    });
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

  checkProfileExists() {
    this.profileService
      .checkProfileExists()
      .subscribe((data) => console.log(data));
  }

  createProfile() {
    this.profileService.createProfile().subscribe((data) => console.log(data));
  }

  deleteProfile() {
    this.profileService.deleteProfile().subscribe((data) => console.log(data));
  }

  getOrcidData() {
    this.profileService.getOrcidData().subscribe((data) => console.log(data));
  }

  getProfileData() {
    this.editorData = null;
    this.profileService.getProfileData().subscribe((data) => {
      console.log(data);
      this.editorData = data;
    });
  }

  patchProfileDataSingle(item) {
    let patchItem = {
      id: item.id,
      show: !item.show,
    };
    this.profileService
      .patchProfileDataSingle(patchItem)
      .subscribe((data) => console.log(data));
  }
}
