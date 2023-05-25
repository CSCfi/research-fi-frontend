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
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { mergePublications } from '@mydata/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftService } from '@mydata/services/draft.service';
import { PatchService } from '@mydata/services/patch.service';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { Constants } from '@mydata/constants/';
import { PublicationsService } from '@mydata/services/publications.service';
import { CommonStrings } from '@mydata/constants/strings';
import { getName } from '@mydata/utils';
import { UtilityService } from '@shared/services/utility.service';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { CollaborationsService } from '@mydata/services/collaborations.service';
import { lastValueFrom, Observable, Subject, timer, BehaviorSubject, combineLatest } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { Person } from '@portal/models/person/person.model';
import { SingleItemService } from '@portal/services/single-item.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('collaborationComponentRef') collaborationComponentRef;

  orcidData: any;
  profileData: any;
  testData: any;
  orcid: string;
  currentProfileName: string;

  publishUpdatedProfile = $localize`:@@publishUpdatedProfile:Julkaise päivitetty profiili`;
  discardChanges = $localize`:@@discardChanges:Hylkää muutokset`;
  termsForTool = CommonStrings.termsForTool;
  processingOfPersonalData = CommonStrings.processingOfPersonalData;

  republishUpdatedProfile = $localize`:@@mydata.profile.republish-modal.title:Julkaise piilotettu profiili`;
  republishText = $localize`:@@publish:Julkaise`;

  // Dialog variables
  showDialog: boolean;
  dialogTitle: any;
  dialogTemplate: any;
  dialogExtraContentTemplate: any;
  currentDialogActions: any[];
  disableDialogClose: boolean;
  showDataToPublish = $localize`:@@showDataToPublish:Näytä julkaistavat tiedot`;
  basicDialogActions = [
    { label: $localize`:@@close:Sulje`, primary: true, method: 'close' },
  ];
  publishUpdatedProfileDialogActions = [
    {
      label: this.showDataToPublish,
      labelToggle: {
        on: this.showDataToPublish,
        off: $localize`:@@hideDataToPublish:Piilota julkaistavat tiedot`,
      },
      primary: false,
      method: 'preview',
      flexStart: true,
    },
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@publish:Julkaise`, primary: true, method: 'publish' },
  ];
  discardChangesActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: this.discardChanges,
      primary: true,
      method: 'discard',
    },
  ];

  republishActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: this.republishText,
      primary: true,
      method: 'republish',
    },
  ];

  connProblem: boolean;
  loading: boolean;

  draftPayload: any[];

  previousRoute: string | undefined;
  showWelcomeDialog = false;

  private unsubscribe = new Subject();

  // person$: Observable<Person>;
  person$ = new BehaviorSubject<Person>(null);

  hasProfile$: Observable<boolean>;
  profileVisible$ = this.profileService.getProfileVisibility();

  edited$ = combineLatest([
    this.publicationsService.currentPublicationPayload,
    this.datasetsService.currentDatasetPayload,
    this.fundingsService.currentFundingPayload,
    this.patchService.currentPatchItems,
    this.collaborationsService.currentCollaborationsPayload,
  ]).pipe(
    map(([pubs, datasets, fundings, patches, collabs]) => !!(pubs.length || datasets.length || fundings.length || patches.length || collabs.length))
  );

  constructor(
    public profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    public appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    public draftService: DraftService,
    public patchService: PatchService,
    public collaborationsService: CollaborationsService,
    public publicationsService: PublicationsService,
    public datasetsService: DatasetsService,
    public fundingsService: FundingsService,
    private utilityService: UtilityService,
    private singleItemService: SingleItemService,
  ) {
    this.profileService.initializeProfileVisibility();

    this.testData = profileService.testData;

    // Find if user has navigated to profile route from service deployment stepper
    // Display welcome dialog if so
    this.previousRoute = this.router
      .getCurrentNavigation()
      .previousNavigation?.finalUrl.toString();
  }

  ngOnInit(): void {
    this.utilityService.setMyDataTitle($localize`:@@profile:Profiili`);

    // Get data from resolver
    const orcidProfile = this.route.snapshot.data.orcidProfile;
    const myDataProfile = this.route.snapshot.data.myDataProfile;

    this.orcidData = orcidProfile;
    this.orcid = orcidProfile.orcid;

    /*
     * Draft data is stored in session storage.
     * Set draft data to profile view if draft available.
     * Drafts are deleted with reset and publish methods
     */
    if (this.appSettingsService.isBrowser) {
      const draft = sessionStorage.getItem(Constants.draftProfile);
      const draftPatchPayload = JSON.parse(
        sessionStorage.getItem(Constants.draftPatchPayload)
      );
      const draftPublicationPatchPayload = JSON.parse(
        sessionStorage.getItem(Constants.draftPublicationPatchPayload)
      );
      const draftDatasetPatchPayload = JSON.parse(
        sessionStorage.getItem(Constants.draftDatasetPatchPayload)
      );
      const draftCollaborationPatchPayload = JSON.parse(
        sessionStorage.getItem(Constants.draftCollaborationPatchPayload)
      );
      const draftFundingPatchPayload = JSON.parse(
        sessionStorage.getItem(Constants.draftFundingPatchPayload)
      );

      this.draftPayload = draftPatchPayload;

      // Display either draft profile from storage or profile from database
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        this.draftService.saveDraft(parsedDraft);
        this.profileData = parsedDraft;
        this.profileService.setEditorProfileName(getName(parsedDraft));
      } else {
        this.profileData = myDataProfile.profileData;
        this.profileService.setEditorProfileName(myDataProfile.name);
      }

      // Profile, publications, datasets, collaborations and fundings have separate draft data
      const draftItems = [
        { payload: draftPatchPayload, service: this.patchService },
        {
          payload: draftPublicationPatchPayload,
          service: this.publicationsService,
        },
        {
          payload: draftDatasetPatchPayload,
          service: this.datasetsService,
        },
        {
          payload: draftFundingPatchPayload,
          service: this.fundingsService,
        },
        {
          payload: draftCollaborationPatchPayload,
          service: this.collaborationsService,
        },
      ];

      // Set draft item into view if draft available in storage
      draftItems.forEach((item) => {
        if (item.payload && !this.profileService.profileInitialized) {
          item.service.addToPayload(item.payload);
          item.service.confirmPayload();
        }
      });
    }

    this.profileService.profileInitialized = true;

    this.updatePerson();

    this.hasProfile$ = this.person$.pipe(map((person) => person != null ));
  }

  openDialog(title: string, template: any, extraContentTemplate: any, actions: any, disableDialogClose: boolean) {
    this.dialogTitle = title;
    this.showDialog = true;
    this.dialogTemplate = template;
    this.dialogExtraContentTemplate = extraContentTemplate;
    this.currentDialogActions = actions;
    this.disableDialogClose = disableDialogClose;
  }

  doDialogAction(action: string) {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;

    switch (action) {
      case 'publish': {
        this.publish();
        break;
      }
      case 'discard': {
        this.reset();
        break;
      }
      case 'republish': {
        this.republish();
        break;
      }
    }
  }

  closeDialog() {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
    this.disableDialogClose = false;
  }

  /*
   * Add selected publications to profile
   */
  private handlePublicationsPromise() {
    return new Promise((resolve, reject) => {
      this.publicationsService
        .addPublications()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: (result) => {
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
        });
    });
  }

  /*
   * Patch items to backend
   */
  private patchItemsPromise() {
    const patchItems = this.patchService.confirmedPayLoad;
    return this.profileService.patchObjects(patchItems);
  }

  /*
   * Patch datasets to backend
   */
  private handleDatasetsPromise() {
    // return this.datasetsService.addDatasets();
    return lastValueFrom(this.datasetsService.addDatasets());
  }

  /*
   * Patch fundings to backend
   */
  private handleFundingsPromise() {
    return new Promise((resolve, reject) => {
      this.fundingsService
        .addFundings()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: (result) => {
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
        });
    });
  }

  /*
   * Patch cooperation choices to backend
   */
  private patchCooperationChoicesPromise() {
    return new Promise((resolve, reject) => {
      this.collaborationsService
        .patchCooperationChoices()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: (result) => {
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
        });
    });
  }

  async publish() {
    const promises = [];

    // Use of handler property as function prevents handler method firing when iterating
    const promiseHandlers: {handler: () => Promise<any>, payload: any}[] = [
      {
        handler: () => this.handlePublicationsPromise(),
        payload: this.publicationsService.confirmedPayload,
      },
      {
        handler: () => this.handleDatasetsPromise(),
        payload: this.datasetsService.confirmedPayload,
      },
      {
        handler: () => this.handleFundingsPromise(),
        payload: this.fundingsService.confirmedPayload,
      },
      {
        handler: () => this.patchItemsPromise(),
        payload: this.patchService.confirmedPayLoad,
      },
      {
        handler: () => this.patchCooperationChoicesPromise(),
        payload: this.collaborationsService.confirmedPayload,
      },
    ];

    // Prevent empty payload API requests
    for (const item of promiseHandlers) {
      if (item.payload.length > 0) {
        promises.push(item.handler());
      }
    }

    // Enable hide profile button in account settings section, if it has been disabled
    sessionStorage.removeItem('profileHidden');

    try {
      const response = await Promise.all(promises);
      if (response.includes(false)) {
        this.snackbarService.showPatchMessage('error');
      } else {
        this.clearDraftData();
        this.snackbarService.showPatchMessage('success');
      }
    } catch (error) {
      this.snackbarService.showPatchMessage('error');
      console.error(`Error in data patching`, error);
    }

    this.profileService.setCurrentProfileData(this.profileData);

    await this.setProfileVisible();
    await this.pollProfile();
  }

  /*
   * Clear draft data from storage and service
   */
  reset() {
    const currentProfileData = cloneDeep(
      this.profileService.currentProfileData
    );

    sessionStorage.removeItem(Constants.draftProfile);
    sessionStorage.removeItem(Constants.draftPatchPayload);
    sessionStorage.removeItem(Constants.draftPublicationPatchPayload);
    sessionStorage.removeItem(Constants.draftDatasetPatchPayload);
    sessionStorage.removeItem(Constants.draftFundingPatchPayload);
    sessionStorage.removeItem(Constants.draftCollaborationPatchPayload);

    this.profileData = currentProfileData;
    this.profileService.setEditorProfileName(getName(currentProfileData));
    this.clearDraftData();
    this.collaborationComponentRef?.resetInitialValue();
  }

  clearDraftData() {
    const itemServices = [
      this.patchService,
      this.collaborationsService,
      this.publicationsService,
      this.datasetsService,
      this.fundingsService,
    ];

    itemServices.forEach((service) => {
      service.clearPayload();
      service.cancelConfirmedPayload();
    });

    this.draftService.clearData();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  private updatePerson() {
    const id = this.orcid;

    const source = this.singleItemService.getSinglePerson(id);

    source.subscribe({
        next: (search) => {
          const person = search.persons[0] as Person;

          if (person != null) {
            this.person$.next(person);
          }
        },
        error: (error) => {
          console.error("Error in updating person", error);
        }
      }
    );

    return source;
  }

  private async setProfileVisible() {
    await this.profileService.showProfile();
  }

  async republish() {


    try {
      const response = await this.setProfileVisible();
      await this.pollProfile();
      this.snackbarService.showPatchMessage('success');
    } catch (error) {
      console.error(`Error in data patching`, error);
    }
  }

  private async pollProfile() {
    let response;
    const delays = [2000, 2000, 2000, 2000, 20000];

    for (const delay of delays) {
      await lastValueFrom(timer(delay));
      console.log("polling profile");

      response = await lastValueFrom(this.updatePerson());

      if (response != null) { return; }
    }
  }

}
