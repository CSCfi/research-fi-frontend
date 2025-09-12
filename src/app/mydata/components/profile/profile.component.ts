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
  ViewChild, ChangeDetectorRef, OnDestroy, Output, EventEmitter, Inject
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
import { NgIf, AsyncPipe, JsonPipe, DOCUMENT } from '@angular/common';
import { BannerDividerComponent } from '@shared/components/banner-divider/banner-divider.component';
import {
  MydataSideNavigationComponent
} from '@mydata/components/mydata-side-navigation/mydata-side-navigation.component';
import { StickyFooterComponent } from '@mydata/components/sticky-footer/sticky-footer.component';
import {
  NameAndOrcidViewComponent
} from '@mydata/components/shared-layouts/name-and-orcid-view/name-and-orcid-view.component';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { clone, cloneDeep } from 'lodash-es';
import {
  OpenScienceSettingsCardComponent
} from '@mydata/components/profile/cards/open-science-settings-card/open-science-settings-card.component';
import {
  BannerContent,
  GeneralInfoBannerComponent
} from '@shared/components/general-info-banner/general-info-banner.component';
import { $localize } from '@angular/localize/init';

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
    NameAndOrcidViewComponent,
    OpenScienceSettingsCardComponent,
    GeneralInfoBannerComponent
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Output() emitHighlightOpenness = new BehaviorSubject<boolean>(false);
  @ViewChild('collaborationComponentRef') collaborationComponentRef;

  highlightOpennessSub = new BehaviorSubject(undefined);

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

  automaticPublishingBannerContent: BannerContent = {
    bannerId: 'automatic_publishing_banner',
    bannerType: 'profile-tool-banner',
    iconType: 'info',
    bannerTheme: 'yellow',
    heading: $localize`:@@automaticPublishingIsPossible:Tietojen automaattinen julkaiseminen on nyt mahdollista`,
    textContent: $localize`:@@automaticPublishingShortDescription:Voit määrittää, että sinuun liittyvät uudet tiedot julkaistaan automaattisesti profiilissasi.`,
    link1Target: 'internal',
    link1Text: $localize`:@@readMoreAndTakeIntoUse:Lue lisää ja ota käyttöön`,
    link1Url: '/mydata/profile/account-settings',
    rememberDismissed: true
  }

  constructor(
    public profileService: ProfileService,
    public appSettingsService: AppSettingsService,
    private router: Router,
    private route: ActivatedRoute,
    public draftService: DraftService,
    private utilityService: UtilityService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: any,
  ) {
    this.profileService.fetchProfileVisibilityAndSettings();
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
        this.reloadViewData();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  updateHighlightOpennessUiState(state: boolean){
    // Used only by profile summary
    this.emitHighlightOpenness.next(state);
    // Used only by open science settings card
    this.highlightOpennessSub.next(state);
  }

  // Called only by open science settings card
  setHighlightOpennessState(state: boolean) {
    this.draftService.addToHighlightOpennessPayload(state);
    this.updateHighlightOpennessUiState(state);
  }

  setAutomaticPublishingState(state: boolean) {
    this.draftService.addToAutomaticPublishingPayload(state);
    //this.updateHighlightOpennessUiState(state);
  }

  resetProfileData() {
    this.profileData = cloneDeep(this.profileService.currentProfileData);
    this.collaborationComponentRef?.resetInitialValue();
  }

  reloadViewData() {
    this.utilityService.setMyDataTitle($localize`:@@profile:Profiili`);

    // Get data from resolver
    const orcidProfile = this.route.snapshot.data.orcidProfile;
    this.orcid = orcidProfile.orcid;
    this.draftService.setOrcidData(orcidProfile);

    /*
     * Draft data is stored in session storage.
     * Set draft data to profile view if draft available.
     * Drafts are deleted with reset and publish methods
     */
    this.profileService.fetchProfileVisibilityAndSettings().then(val => {
      if (val) {
        const draftHighlightOpennessState = this.draftService.getDraftHighlightOpennessState();
        if (draftHighlightOpennessState) {
          // State from draft
          this.updateHighlightOpennessUiState(draftHighlightOpennessState[0]);
        } else {
          // Original state from back end
          this.updateHighlightOpennessUiState(val?.data?.highlightOpeness);
        }
      }
      else {
        const opennessState = this.draftService.getDraftHighlightOpennessState();
        if (opennessState && opennessState[0]){
          this.updateHighlightOpennessUiState(this.draftService.getDraftHighlightOpennessState()[0]);
        }
      }

      const parsedDraft = this.draftService.getDraftProfile();
      // Display either draft profile from storage or profile from database
      if (parsedDraft) {
        this.profileData = parsedDraft;
        this.profileService.setEditorProfileName(getName(parsedDraft));
      } else {
        this.profileService.clearCurrentProfileData();
        this.profileService
          .fetchProfileDataFromBackend()
          .then(
            (value) => {
              if (value) {
                this.profileService.setCurrentProfileData(
                  cloneDeep(value.profileData)
                );
                this.profileData = clone(value.profileData);
              }
            });
        this.profileService.setEditorProfileName(this.route.snapshot.data.myDataProfile.name);
      }
      this.fullName = this.profileService.currentEditorProfileName;
      //this.highlightOpennessInitialState$ = this.draftService.highlightOpennessPayloadSubObs;
      //this.highlightOpennessInitialState$ = this.profileService.getHighlighOpennessInitialStateObservable();
      }
    );

  }

  ngOnDestroy() {
    this.dataHasBeenResetSub.unsubscribe();
  }
}
