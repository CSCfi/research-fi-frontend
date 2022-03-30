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
import { take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { WINDOW } from '@shared/services/window.service';
import { isPlatformBrowser } from '@angular/common';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonStrings } from '@mydata/constants/strings';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';
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
    { title: $localize`:@@welcome:Tervetuloa` },
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

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    private route: ActivatedRoute,
    private router: Router,
    private appSettingsService: AppSettingsService,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(WINDOW) private window: Window,
    public dialog: MatDialog,
    private utilityService: UtilityService
  ) {
    this.profileData = null;
  }

  ngOnInit() {
    this.checkProfileExists();

    this.userDataSub = this.oidcSecurityService.userData$
      .pipe(take(1))
      .subscribe((data) => {
        if (data) {
          const userData = data.userData;
          this.userData = userData;
          this.profileName = userData?.name;
          this.appSettingsService.setOrcid(userData.orcid);
        }
      });

    // Enable route refresh / locale change
    this.routeSub = this.route.queryParams.subscribe((params) => {
      const step = params.step;

      if (
        step === '3' &&
        !this.termsApproved &&
        !this.personalDataHandlingApproved
      ) {
        this.navigateStep(2);
        this.step = 2;
      } else if (params.step === 'cancel') {
        this.cancel = true;
        this.step = this.step ? this.step : 1;
      } else {
        this.step = parseInt(step, 10) || 1;
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
    if (this.step === 3 && direction === 'increment') {
      this.fetchData();
    } else {
      direction === 'increment' ? this.increment() : this.decrement();
    }
  }

  createTitle(step: number) {
    return `${this.step}/3 ${this.steps[step - 1].title}`;
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
    this.openDataFetchingDialog();
    this.createProfile();
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

  accountlink() {
    this.profileData = null;
    this.profileService.accountlink().subscribe((data) => {});
  }

  ngOnDestroy(): void {
    this.userDataSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.profileExistsCheckSub?.unsubscribe();
    this.createProfileSub?.unsubscribe();
    this.profileDataSub?.unsubscribe();
  }


  // Generate random string
  getNonce(length) {
    var text = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return text;
  }

  async getNewAccessToken() {
    console.log('getNewAccessToken()');
    this.oidcSecurityService.revokeAccessToken();
  }

 arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

  async getOrcidLink() {
    console.log("getOrcidLink");
    var idTokenPayload = this.oidcSecurityService.getPayloadFromIdToken();

    // Get property clientId from property 'azp' in ID token.
    // azp: Authorized party - the party to which the ID Token was issued
    var clientId = idTokenPayload.azp;
    console.log(clientId);

    // Get property 'session_state' from ID token.
    var session_state = idTokenPayload.session_state;
    console.log(session_state);

    var nonce = this.getNonce(64);
    console.log(nonce);
    
    var input = nonce + session_state + clientId + 'orcid';
    console.log(input);

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const sha256 = await crypto.subtle.digest('SHA-256', data);

    // Remove padding equal characters and replace characters according to base64url specifications.
    const base64encoded = this.arrayBufferToBase64(sha256).replace(/\//g, '_').replace(/=+$/, '').replace(/\+/g, '-');

    /*
    Base64 URL encoded hash. This hash is generated by Base64 URL encoding a SHA_256 hash of nonce + token.getSessionState() + token.getIssuedFor() + provider
    */
    console.log(base64encoded);

    const redirect_uri = encodeURIComponent('https://localhost:5003/mydata/welcome');

    const link = 'https://tnxwork.eu.ngrok.io/auth/realms/mydata/broker/orcid/link?client_id=js&redirect_uri=' + redirect_uri + '&nonce=' + nonce + '&hash=' + base64encoded;
    console.log(link);
    this.orcidLink = link;
    // {auth-server-root}/auth/realms/{realm}/broker/{provider}/link?client_id={id}&redirect_uri={uri}&nonce={nonce}&hash={hash}

    //var input = nonce + this.oidcSecurityService.getAccessToken().
  }

}
