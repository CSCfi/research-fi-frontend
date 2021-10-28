//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  Inject,
  PLATFORM_ID,
  ElementRef,
} from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from 'src/app/mydata/services/profile.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WINDOW } from '@shared/services/window.service';
import { isPlatformBrowser } from '@angular/common';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-welcome-stepper',
  templateUrl: './welcome-stepper.component.html',
  styleUrls: ['./welcome-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeStepperComponent implements OnInit {
  develop: boolean;
  step: number;
  cancel = false;

  termsApproved = false;
  personalDataHandlingApproved = false;

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  userData: any;
  firstName: string;

  @ViewChild('fetchingTemplate') fetchingTemplate: ElementRef;

  profileChecked: boolean;
  profileCreated: boolean;
  profileData: Object;

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle: any;
  dialogActions = [{ label: 'Sulje', primary: true, method: 'close' }];
  disableDialogClose: boolean;

  loading: boolean;

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    private router: Router,
    private appSettingsService: AppSettingsService,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(WINDOW) private window: Window,
    public dialog: MatDialog
  ) {
    this.profileData = null;
  }

  ngOnInit() {
    this.develop = this.appSettingsService.myDataSettings.develop;

    if (!this.develop) {
      this.checkProfileExists();
    } else {
      this.profileChecked = true;
    }

    this.step = this.develop ? 4 : 1;

    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      if (data) {
        this.userData = data;
        this.firstName = data?.name.split(' ')[0];
        this.appSettingsService.setOrcid(data.orcid);
      }
    });
  }

  changeStep(direction) {
    // Scroll to top on step change
    if (isPlatformBrowser(this.platformId)) {
      this.window.scrollTo(0, 0);
    }

    // Fetch data if on step 3 and user has initialized Orcid data fetch
    if (this.step === 3 && direction === 'increment') {
      this.fetchData();
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

  fetchData() {
    this.openDataFetchingDialog();
    this.createProfile();
  }

  // Redirect to profile summary if profile exists.
  checkProfileExists() {
    this.profileService
      .checkProfileExists()
      .pipe(take(1))
      .subscribe((data: any) => {
        if (data.ok) {
          if (data.body.success) this.router.navigate(['/mydata/profile']);

          this.profileChecked = true;
        } else {
          // TODO: Alert problem
        }
      });
  }

  // Create profile when proceeding from step 3. Get ORCID and profile data after profile creation
  createProfile() {
    return this.profileService
      .createProfile()
      .pipe(take(1))
      .subscribe((data: any) => {
        if (data.ok) {
          this.getOrcidData();
          this.profileCreated = true;
        } else {
          // TODO: Alert problem
        }
      });
  }

  openDialog(title, template) {
    this.dialogTitle = title;
    this.showDialog = true;
    this.dialogTemplate = template;
  }

  doDialogAction() {
    this.resetDialog();
  }

  resetDialog() {
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
  }

  openDataFetchingDialog() {
    this.loading = true;
    this.dialogTemplate = this.fetchingTemplate;
    this.disableDialogClose = true;
  }

  deleteProfile() {
    this.profileService.deleteProfile();
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
      this.dialog.closeAll();
      this.loading = false;
      this.resetDialog();
      this.router.navigate(['/mydata/profile']);
    });
  }
}
