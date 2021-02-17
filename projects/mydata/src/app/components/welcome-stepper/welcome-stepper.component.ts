//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-welcome-stepper',
  templateUrl: './welcome-stepper.component.html',
  styleUrls: ['./welcome-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeStepperComponent implements OnInit, OnDestroy {
  step = 1;
  cancel = false;
  dataFetched = false;
  termsApproved = false;
  personalDataHandlingApproved = false;
  fetching = false;
  userData: any;
  userName: string;
  isLoading = true;

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;
  tokenSub: Subscription;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.tokenSub = this.authService.tokenReceived.subscribe((hasToken) => {
      if (hasToken) {
        const userData = this.authService.getUserData();
        this.userName = userData.name.split(' ')[0];
        this.isLoading = false;
      }
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

  createProfile() {
    this.profileService.createProfile().subscribe((data) => console.log(data));
  }

  deleteProfile() {
    this.profileService.deleteProfile().subscribe((data) => console.log(data));
  }

  ngOnDestroy() {
    this.tokenSub.unsubscribe();
  }
}
