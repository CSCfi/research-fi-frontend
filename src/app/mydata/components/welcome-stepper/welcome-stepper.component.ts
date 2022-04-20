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
  OnDestroy,
} from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from 'src/app/mydata/services/profile.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { switchMap, take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { WINDOW } from '@shared/services/window.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonStrings } from '@mydata/constants/strings';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';
import { OrcidAccoungLinkingService } from '@mydata/services/orcid-account-linking.service';
import { isNumber } from 'lodash';
import { randomUUID } from 'crypto';

@Component({
  selector: 'app-welcome-stepper',
  templateUrl: './welcome-stepper.component.html',
  styleUrls: ['./welcome-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeStepperComponent implements OnInit, OnDestroy {
  develop: boolean;
  step: number = 1;
  cancel = false;

  termsApproved = false;
  personalDataHandlingApproved = false;

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  userData: any;
  profileName: string;

  @ViewChild('fetchingTemplate') fetchingTemplate: ElementRef;

  profileChecked: boolean;
  profileCreated: boolean;
  profileData: Object;

  steps = [
    { title: 'Tunnistautuminen onnistui' },
    {
      title: $localize`:@@termsPersonalDataProcessing:Käyttöehdot ja henkilötietojen käsittely`,
    },
    { title: $localize`:@@importingDataFromOrcid:Tietojen tuominen Orcidista` },
  ];

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle: any;
  dialogActions = [
    { label: $localize`:@@close:Sulje`, primary: true, method: 'close' },
  ];
  disableDialogClose: boolean;

  loading: boolean;

  termsForTool = CommonStrings.termsForTool;
  processingOfPersonalData = CommonStrings.processingOfPersonalData;
  cancelServiceDeployment = $localize`:@@cancelServiceDeployment:Peruutetaanko palvelun käyttöönotto?`;
  userDataSub: Subscription;
  routeSub: Subscription;
  orcidLink: string;
  profileExistsCheckSub: Subscription;
  createProfileSub: Subscription;
  profileDataSub: Subscription;
  IDPLinkSub: Subscription;

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    private orcidAccountLinkingService: OrcidAccoungLinkingService,
    private route: ActivatedRoute,
    private router: Router,
    private appSettingsService: AppSettingsService,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(WINDOW) private window: Window,
    public dialog: MatDialog,
    private utilityService: UtilityService,
    @Inject(DOCUMENT) private document: any
  ) {
    this.profileData = null;
  }

  ngOnInit() {
    this.oidcSecurityService.userData$.subscribe((data) => {
      if (data.userData) {
        const userData = data.userData;
        this.userData = userData;
        this.profileName = userData?.name;

        this.profileChecked = true;

        if (userData.orcid) {
          this.appSettingsService.setOrcid(userData.orcid);
        }
      }
    });

    // this.profileService.accountlink().subscribe(() => {
    //   // this.checkProfileExists();
    // });

    // this.profileService.accountlink().subscribe(() => {
    //   this.checkProfileExists();
    //   this.userDataSub = this.oidcSecurityService.userData$
    //     .pipe(take(1))
    //     .subscribe((data) => {
    //       if (data) {
    //         const userData = data.userData;
    //         this.userData = userData;
    //         this.profileName = userData?.name;
    //         this.appSettingsService.setOrcid(userData.orcid);
    //       }
    //     });
    // });

    // this.userDataSub = this.oidcSecurityService.userData$
    //   .pipe(take(1))
    //   .subscribe((data) => {
    //     if (data) {
    //       this.profileChecked = true;
    //       const userData = data.userData;
    //       this.userData = userData;
    //       this.profileName = userData?.name;
    //       this.appSettingsService.setOrcid(userData.orcid);
    //     }
    //   });

    // Enable route refresh / locale change
    this.routeSub = this.route.queryParams.subscribe((params) => {
      const step = params.step;

      if (step === '2') {
        this.IDPLinkSub = this.profileService
          .accountlink()
          .pipe(switchMap(() => this.oidcSecurityService.forceRefreshSession()))
          .subscribe(() => {
            const idTokenPayload =
              this.oidcSecurityService.getPayloadFromIdToken();

            this.userData.orcid = idTokenPayload.orcid;
            this.appSettingsService.setOrcid(idTokenPayload.orcid);
          });
      }

      if (params.step === 'cancel') {
        this.cancel = true;
        this.step = this.step ? this.step : 1;
      } else {
        this.step = Number(step) || 1;
      }

      this.utilityService.setMyDataTitle(this.createTitle(this.step));
    });
  }

  navigateStep(step) {
    this.router.navigate([], { queryParams: { step: step } });
  }

  changeStep(direction: string) {
    // Scroll to top on step change
    if (isPlatformBrowser(this.platformId)) {
      this.window.scrollTo(0, 0);
    }

    if (direction === 'cancel') {
      return this.toggleCancel();
    }

    // Fetch data if on step 3 and user has initialized Orcid data fetch
    if (this.step === 2 && direction === 'increment') {
      this.fetchData();
    } else {
      direction === 'increment' ? this.increment() : this.decrement();
    }
  }

  createTitle(step: number) {
    return `${this.steps[step - 1].title}`;
  }

  increment() {
    this.step = this.step + 1;
    this.utilityService.setMyDataTitle(this.createTitle(this.step));
    this.navigateStep(this.step);
  }

  decrement() {
    this.step = this.step - 1;
    this.utilityService.setMyDataTitle(this.createTitle(this.step));
    this.navigateStep(this.step);
  }

  toggleCancel() {
    this.navigateStep(!this.cancel ? 'cancel' : this.step);

    this.utilityService.setMyDataTitle(
      this.cancel
        ? this.steps[this.step - 1].title
        : this.cancelServiceDeployment
    );
    this.cancel = !this.cancel;
  }

  fetchData() {
    this.profileData = null;
    this.profileService.accountlink().subscribe(() => {
      this.openDataFetchingDialog();
      this.createProfile();
    });
  }

  // Redirect to profile summary if profile exists.
  checkProfileExists() {
    this.profileExistsCheckSub = this.profileService
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
    return (this.createProfileSub = this.profileService
      .createProfile()
      .pipe(take(1))
      .subscribe((data: any) => {
        if (data.ok) {
          this.getOrcidData();
          this.profileCreated = true;
        } else {
          // TODO: Alert problem
        }
      }));
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
    this.profileDataSub = this.profileService
      .getProfileData()
      .pipe(take(1))
      .subscribe((data) => {
        this.profileData = data;
        this.dialog.closeAll();
        this.loading = false;
        this.resetDialog();
        this.router.navigate(['/mydata/profile']);
      });
  }

  ngOnDestroy(): void {
    this.userDataSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.profileExistsCheckSub?.unsubscribe();
    this.createProfileSub?.unsubscribe();
    this.profileDataSub?.unsubscribe();
    this.IDPLinkSub?.unsubscribe();
  }

  accountlink() {
    this.profileData = null;
    this.profileService.accountlink().subscribe((data) => {});
  }

  async getOrcidLink() {
    this.orcidLink = await this.orcidAccountLinkingService.getOrcidLink();
  }

  loginOrcid() {
    this.getOrcidLink().then(() => {
      if (this.orcidLink) {
        this.document.location.href = this.orcidLink;
      } else {
        console.error('Unable to get ORCID link');
      }
    });
  }
}
