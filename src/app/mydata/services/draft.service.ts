//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Constants } from '@mydata/constants';
import { getName } from '@mydata/utils';
import { ProfileService } from '@mydata/services/profile.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { MatDialog } from '@angular/material/dialog';
import { PatchService } from '@mydata/services/patch.service';
import { CollaborationsService } from '@mydata/services/collaborations.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { UtilityService } from '@shared/services/utility.service';
import { SingleItemService } from '@portal/services/single-item.service';
import { map, take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, lastValueFrom, Observable, Subject, Subscription, timer } from 'rxjs';
import { Person } from '@portal/models/person/person.model';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { cloneDeep } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class DraftService {
  draftProfileData: any;
  orcidData: any;
  orcid: string;

  person$ = new BehaviorSubject<Person>(null);

  hasProfile$: Observable<boolean>;
  public showLogoutConfirmModal = new BehaviorSubject<boolean>(false);

  edited$ = combineLatest([
    this.publicationsService.currentPublicationPayload,
    this.datasetsService.currentDatasetPayload,
    this.fundingsService.currentFundingPayload,
    this.patchService.currentPatchItems,
    this.collaborationsService.currentCollaborationsPayload,
  ]).pipe(
    map(([pubs, datasets, fundings, patches, collabs]) => !!(pubs.length || datasets.length || fundings.length || patches.length || collabs.length))
  );
  private collaborationOptionsSub: Subscription;

  constructor(private appSettingsService: AppSettingsService,
              public profileService: ProfileService,
              public oidcSecurityService: OidcSecurityService,
              public dialog: MatDialog,
              public patchService: PatchService,
              public collaborationsService: CollaborationsService,
              public publicationsService: PublicationsService,
              public datasetsService: DatasetsService,
              public fundingsService: FundingsService,
              private utilityService: UtilityService,
              private snackbarService: SnackbarService,
              private singleItemService: SingleItemService) {
    this.init();
  }

  private unsubscribe = new Subject();

  init() {  /*
     * Draft data is stored in session storage.
     * Set draft data to profile view if draft available.
     * Drafts are deleted with reset and publish methods
     */
    if (this.appSettingsService.isBrowser) {
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

      // Profile, publications, datasets, collaborations and fundings have separate draft data
      const draftItems = [
        { payload: draftPatchPayload, service: this.patchService },
        {
          payload: draftPublicationPatchPayload,
          service: this.publicationsService
        },
        {
          payload: draftDatasetPatchPayload,
          service: this.datasetsService
        },
        {
          payload: draftFundingPatchPayload,
          service: this.fundingsService
        },
        {
          payload: draftCollaborationPatchPayload,
          service: this.collaborationsService
        }
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
    //this.fetchCollaborationChoices();
  }

  getDraftProfile() {
    let profileData = undefined;
    if (this.appSettingsService.isBrowser) {
      const draft = sessionStorage.getItem(Constants.draftProfile);

      // Display either draft profile from storage or profile from database
      if (draft) {
        profileData = JSON.parse(draft);
        this.profileService.setEditorProfileName(getName(profileData));
      }
    }
    return profileData;
  }

  updateFieldInDraft(fieldId: string, data: any) {
    if (fieldId && data) {
      sessionStorage.setItem(fieldId, JSON.stringify(data)
      );
    }
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
    this.clearData();
  }

  clearData() {
    if (this.appSettingsService.isBrowser) {
      sessionStorage.removeItem(Constants.draftProfile);
      sessionStorage.removeItem(Constants.draftPatchPayload);
      sessionStorage.removeItem(Constants.draftPublicationPatchPayload);
      sessionStorage.removeItem(Constants.draftDatasetPatchPayload);
      sessionStorage.removeItem(Constants.draftFundingPatchPayload);
      sessionStorage.removeItem(Constants.draftCollaborationPatchPayload);
    }
  }

  public setOrcidData(orcidProfile: any){
    this.orcidData = orcidProfile;
    this.orcid = orcidProfile.orcid;
    this.init();
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

  updatePerson() {
    console.log('this.orcid', this.orcid);
    const id = this.orcid;
    if (this.orcid) {
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

      response = await lastValueFrom(this.updatePerson());

      if (response != null) { return; }
    }
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

    this.profileService.setCurrentProfileData(this.draftProfileData);

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
    this.draftProfileData = currentProfileData;
    this.profileService.setEditorProfileName(getName(currentProfileData));
    this.clearDraftData();
    //TODO: this.collaborationComponentRef?.resetInitialValue();
    //TODO: Call refresh in profile?
  }

}
