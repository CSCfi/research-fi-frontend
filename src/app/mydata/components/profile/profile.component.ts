//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftService } from '@mydata/services/draft.service';
import { CommonStrings } from '@mydata/constants/strings';
import { getName } from '@mydata/utils';
import { UtilityService } from '@shared/services/utility.service';
import { MydataBetaInfoComponent } from '../mydata-beta-info/mydata-beta-info.component';
import { CollaborationCardComponent } from './cards/collaboration-card/collaboration-card.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ProfileSummaryComponent } from './profile-summary/profile-summary.component';
import { ContactCardComponent } from './cards/contact-card/contact-card.component';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';
import { NgIf, AsyncPipe, JsonPipe } from '@angular/common';
import { BannerDividerComponent } from '@shared/components/banner-divider/banner-divider.component';
import {
  MydataSideNavigationComponent
} from '@mydata/components/mydata-side-navigation/mydata-side-navigation.component';
import { StickyFooterComponent } from '@mydata/components/sticky-footer/sticky-footer.component';
import {
  NameAndOrcidViewComponent
} from '@mydata/components/shared-layouts/name-and-orcid-view/name-and-orcid-view.component';
import { Observable, Subscription } from 'rxjs';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    NgIf,
    WelcomeDialogComponent,
    ContactCardComponent,
    ProfileSummaryComponent,
    MatProgressSpinner,
    CollaborationCardComponent,
    MydataBetaInfoComponent,
    AsyncPipe,
    BannerDividerComponent,
    MydataSideNavigationComponent,
    StickyFooterComponent,
    JsonPipe,
    NameAndOrcidViewComponent
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('collaborationComponentRef') collaborationComponentRef;

  profileData: any;
  orcid: string;
  fullName: Observable<string>;

  publishUpdatedProfile = $localize`:@@publishUpdatedProfile:Julkaise päivitetty profiili`;
  discardChanges = $localize`:@@discardChanges:Hylkää muutokset`;
  termsForTool = CommonStrings.termsForTool;
  processingOfPersonalData = CommonStrings.processingOfPersonalData;

  previousRoute: string | undefined;
  showWelcomeDialog = false;
  dataHasBeenResetSub: Subscription;

  constructor(
    public profileService: ProfileService,
    public appSettingsService: AppSettingsService,
    private router: Router,
    private route: ActivatedRoute,
    public draftService: DraftService,
    private utilityService: UtilityService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.profileService.initializeProfileVisibility();
      this.fullName = this.profileService.getEditorProfileNameObservable();

    // Find if user has navigated to profile route from service deployment stepper
    // Display welcome dialog if so
    this.previousRoute = this.router
      .getCurrentNavigation()
      .previousNavigation?.finalUrl.toString();
  }

  ngOnInit(): void {
    this.reloadViewData();
    this.dataHasBeenResetSub = this.draftService.dataHasBeenReset.subscribe(val => {
      if (val === true) {
        this.resetProfileData();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  resetProfileData(){
    this.profileData = cloneDeep(this.profileService.currentProfileData);
    this.collaborationComponentRef?.resetInitialValue();
  }

  reloadViewData(){
    this.utilityService.setMyDataTitle($localize`:@@profile:Profiili`);

    // Get data from resolver
    const orcidProfile = this.route.snapshot.data.orcidProfile;
    this.orcid = orcidProfile.orcid;
    const myDataProfile = this.route.snapshot.data.myDataProfile;
    this.draftService.setOrcidData(orcidProfile);

    /*
     * Draft data is stored in session storage.
     * Set draft data to profile view if draft available.
     * Drafts are deleted with reset and publish methods
     */
    if (this.appSettingsService.isBrowser) {
      const parsedDraft = this.draftService.getDraftProfile();

      // Display either draft profile from storage or profile from database
      if (parsedDraft) {
        console.log(parsedDraft);
        this.profileData = parsedDraft;
        console.log('PROFILE FROM DRAFT', myDataProfile);
        this.profileService.setEditorProfileName(getName(parsedDraft));
      } else {
        this.profileData = myDataProfile.profileData;
        console.log('PROFILE', myDataProfile);
        this.profileService.setEditorProfileName(myDataProfile.name);
      }
      this.fullName = this.profileService.currentEditorProfileName;
    }
  }
  ngOnDestroy() {
    this.dataHasBeenResetSub.unsubscribe();
  }
}
