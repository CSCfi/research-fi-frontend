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
} from '@angular/core';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { mergePublications } from '@mydata/utils';
import { Router } from '@angular/router';
import { DraftService } from '@mydata/services/draft.service';
import { PatchService } from '@mydata/services/patch.service';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { cloneDeep } from 'lodash-es';
import { Constants } from '@mydata/constants/';
import { PublicationsService } from '@mydata/services/publications.service';
import { CommonStrings } from '@mydata/constants/strings';
import { checkGroupSelected } from '@mydata/utils';
import { UtilityService } from '@shared/services/utility.service';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { CollaborationsService } from '@mydata/services/collaborations.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit {
  @ViewChild('deletingProfileTemplate') deletingProfileTemplate: ElementRef;
  @ViewChild('collaborationComponentRef') collaborationComponentRef;

  orcidData: any;
  profileData: any;
  testData: any;
  orcid: string;
  currentProfileName: string;

  mergePublications = mergePublications;

  publishUpdatedProfile = $localize`:@@publishUpdatedProfile:Julkaise päivitetty profiili`;
  discardChanges = $localize`:@@discardChanges:Hylkää muutokset`;
  termsForTool = CommonStrings.termsForTool;
  processingOfPersonalData = CommonStrings.processingOfPersonalData;
  deleteProfileTitle = CommonStrings.deleteProfile;

  // Dialog variables
  showDialog: boolean;
  dialogTitle: any;
  dialogTemplate: any;
  dialogExtraContentTemplate: any;
  currentDialogActions: any[];
  disableDialogClose: boolean;
  basicDialogActions = [
    { label: $localize`:@@close:Sulje`, primary: true, method: 'close' },
  ];
  publishUpdatedProfileDialogActions = [
    {
      label: $localize`:@@showDataToPublish:Näytä julkaistavat tiedot`,
      primary: false,
      method: 'preview',
      flexStart: true,
    },
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@publish:Julkaise`, primary: true, method: 'publish' },
  ];
  deleteProfileDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: $localize`:@@deleteProfile:Poista profiili`,
      primary: true,
      method: 'delete',
    },
  ];
  discardChangesActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: this.discardChanges,
      primary: true,
      method: 'discard',
    },
  ];

  connProblem: boolean;
  loading: boolean;
  deletingProfile: boolean;

  draftPayload: any[];

  checkGroupSelected = checkGroupSelected;

  constructor(
    public profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    public appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private router: Router,
    private snackbarService: SnackbarService,
    public draftService: DraftService,
    public patchService: PatchService,
    public collaborationsService: CollaborationsService,
    public publicationsService: PublicationsService,
    public datasetsService: DatasetsService,
    public fundingsService: FundingsService,
    private utilityService: UtilityService
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.utilityService.setMyDataTitle($localize`:@@profile:Profiili`);

    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      const userData = data.userData
      this.orcidData = userData;

      if (userData) {
        this.orcid = userData.orcid;
        this.appSettingsService.setOrcid(userData.orcid);
      }
    });

    this.profileService
      .getProfileData()
      .pipe(take(1))
      .subscribe((response) => {
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
            this.profileService.setCurrentProfileName(
              this.getName(parsedDraft)
            );
          } else {
            this.profileData = response.profileData;
            this.profileService.setCurrentProfileName(
              this.getName(response.profileData)
            );
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
            if (item.payload) {
              item.service.addToPayload(item.payload);
              item.service.confirmPayload();
            }
          });
        }

        // Set original data
        this.profileService.setCurrentProfileData(
          cloneDeep(response.profileData)
        );
      });
  }

  getName(data) {
    return data
      .find((item) => item.id === 'contact')
      .fields[0].groupItems.flatMap((groupItem) => groupItem.items)
      .find((item) => item.itemMeta.show).value;
  }

  openDialog(props: {
    title: string;
    template: any;
    extraContentTemplate: any;
    actions: any;
    disableDialogClose: boolean;
  }) {
    const {
      title,
      template,
      extraContentTemplate,
      actions,
      disableDialogClose,
    } = props;

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
      case 'delete': {
        this.deleteProfile();
        break;
      }
      case 'discard': {
        this.reset();
        break;
      }
    }
  }

  deleteProfile() {
    this.deletingProfile = true;
    this.loading = true;
    this.connProblem = false;

    this.profileService
      .deleteProfile()
      .pipe(take(1))
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.ok && res.body.success) {
            this.dialog.closeAll();
            this.reset();

            // Wait for dialog to close
            setTimeout(() => this.router.navigate(['/mydata']), 500);
          }
        },
        (error) => {
          this.loading = false;
          if (!error.ok) {
            this.connProblem = true;
          }
        }
      );
  }

  closeDialog() {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
    this.deletingProfile = false;
    this.disableDialogClose = false;
  }

  /*
   * Add selected publications to profile
   */
  private async handlePublicationsPromise() {
    return new Promise((resolve, reject) => {
      this.publicationsService
        .addPublications()
        .pipe(take(1))
        .subscribe(
          (result) => {
            resolve(true);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  /*
   * Patch items to backend
   */
  private async patchItemsPromise() {
    return new Promise((resolve, reject) => {
      const patchItems = this.patchService.confirmedPayLoad;
      this.profileService
        .patchObjects(patchItems)
        .pipe(take(1))
        .subscribe(
          (result) => {
            resolve(true);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  /*
   * Patch datasets to backend
   */
  private async handleDatasetsPromise() {
    return new Promise((resolve, reject) => {
      this.datasetsService
        .addDatasets()
        .pipe(take(1))
        .subscribe(
          (result) => {
            resolve(true);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  /*
   * Patch fundings to backend
   */
  private async handleFundingsPromise() {
    return new Promise((resolve, reject) => {
      this.fundingsService
        .addFundings()
        .pipe(take(1))
        .subscribe(
          (result) => {
            resolve(true);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  /*
   * Patch cooperation choices to backend
   */
  private async patchCooperationChoicesPromise() {
    return new Promise((resolve, reject) => {
      this.collaborationsService
        .patchCollaborationChoices()
        .pipe(take(1))
        .subscribe(
          (result) => {
            resolve(true);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  publish() {
    const promises = [];

    // Use of handler property as function prevents handler method firing when iterating
    const promiseHandlers = [
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

    Promise.all(promises)
      .then((response) => {
        if (response.includes(false)) {
          this.showSaveSuccessfulMessage(false);
        } else {
          this.clearDraftData();
          this.showSaveSuccessfulMessage(true);
        }
      })
      .catch((error) => {
        this.showSaveSuccessfulMessage(false);
        console.log(`Error in data patching`, error);
      });
    this.profileService.setCurrentProfileData(this.profileData);
  }

  /*
   * Clear draft data from storage and service
   */
  reset() {
    const currentProfileData = this.profileService.currentProfileData;

    sessionStorage.removeItem(Constants.draftProfile);
    sessionStorage.removeItem(Constants.draftPatchPayload);
    sessionStorage.removeItem(Constants.draftPublicationPatchPayload);
    sessionStorage.removeItem(Constants.draftDatasetPatchPayload);
    sessionStorage.removeItem(Constants.draftFundingPatchPayload);
    sessionStorage.removeItem(Constants.draftCollaborationPatchPayload);

    this.profileData = [...currentProfileData];
    this.profileService.setCurrentProfileName(this.getName(currentProfileData));
    this.clearDraftData();
    this.collaborationComponentRef.resetInitialValue();
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

  showSaveSuccessfulMessage(wasSuccessful: boolean) {
    if (wasSuccessful) {
      this.snackbarService.show(
        $localize`:@@profilePublishedToast:Profiili julkaistu. Tiedot näkyvät muutaman minuutin kuluttua tiedejatutkimus.fi -palvelussa.`,
        'success'
      );
    } else {
      this.snackbarService.show(
        $localize`:@@dataSavingError:Virhe tiedon tallennuksessa`,
        'error'
      );
    }
  }
}
