//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from 'src/app/mydata/services/profile.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs/operators';
import {
  BsModalRef,
  BsModalService,
  ModalDirective,
} from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

// Remove in production
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-welcome-stepper',
  templateUrl: './welcome-stepper.component.html',
  styleUrls: ['./welcome-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeStepperComponent implements OnInit {
  step = 4;
  cancel = false;

  termsApproved = false;
  personalDataHandlingApproved = false;

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  userData: any;
  firstName: string;

  @ViewChild('smModal') smModal: ModalDirective;
  @ViewChild('termsTemplate') termsTemplate: ModalDirective;
  modalRef: BsModalRef;

  profileCreated: boolean;
  profileData: Object;

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    private modalService: BsModalService,
    private router: Router,
    private appSettingsService: AppSettingsService
  ) {
    this.profileData = null;
  }

  ngOnInit() {
    this.step = this.appSettingsService.myDataSettings.develop ? 4 : 1;

    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      this.userData = data;
      this.firstName = data?.name.split(' ')[0];
    });
  }

  changeStep(direction) {
    // Fetch data if on step 3 and user has initialized Orcid data fetch
    if (this.step === 3 && direction === 'increment') {
      this.fetchData();
    } else if (this.step === 4 && direction === 'increment') {
      this.router.navigate(['/mydata/profile']);
    } else {
      direction === 'increment' ? this.increment() : this.decrement();
    }
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

  openModal(template) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  fetchData() {
    this.smModal.show();
    this.checkProfileExists();
  }

  checkProfileExists() {
    this.profileService
      .checkProfileExists()
      .pipe(take(1))
      .subscribe((data: any) => {
        if (data.ok) {
          data.body.success
            ? // ? this.router.navigate(['/profile'])
              this.getProfileData()
            : this.createProfile();
        } else {
          console.log('Connection problem');
        }
      });
  }

  createProfile() {
    return this.profileService
      .createProfile()
      .pipe(take(1))
      .subscribe((data: any) => {
        if (data.ok) {
          this.getOrcidData();
          this.profileCreated = true;
        } else {
          console.log('Cannot create profile');
        }
      });
  }

  deleteProfile() {
    this.profileService.deleteProfile().subscribe((data) => console.log(data));
  }

  async getOrcidData() {
    const response: any = await this.profileService.getOrcidData().toPromise();
    if (response.ok) {
      this.getProfileData();
    }
  }

  getProfileData() {
    this.profileData = null;
    this.profileService.getProfileData().subscribe((data) => {
      this.profileData = data;
      this.smModal.hide();
      this.increment();
    });
  }
}
