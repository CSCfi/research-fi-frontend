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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit {
  orcidData: any;
  profileData: any;
  testData: any;
  orcid: string;

  mergePublications = mergePublications;

  // Dialog variables
  showDialog: boolean;
  dialogTitle: any;
  dialogTemplate: any;
  dialogExtraContentTemplate: any;
  currentDialogActions: any[];
  disableDialogClose: boolean;
  basicDialogActions = [{ label: 'Sulje', primary: true, method: 'close' }];
  publishUpdatedProfileDialogActions = [
    {
      label: 'Näytä julkaistavat tiedot',
      primary: false,
      method: 'preview',
      flexStart: true,
    },
    { label: 'Peruuta', primary: false, method: 'cancel' },
    { label: 'Julkaise', primary: true, method: 'publish' },
  ];
  deleteProfileDialogActions = [
    { label: 'Peruuta', primary: false, method: 'close' },
    { label: 'Poista profiili', primary: true, method: 'delete' },
  ];
  @ViewChild('deletingProfileTemplate') deletingProfileTemplate: ElementRef;

  connProblem: boolean;
  loading: boolean;
  deletingProfile: boolean;

  draftPayload: any[];

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    public appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private router: Router,
    private snackbarService: SnackbarService,
    public draftService: DraftService,
    public patchService: PatchService,
    public publicationsService: PublicationsService
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      this.orcidData = data;

      if (data) {
        this.orcid = data.orcid;
        this.appSettingsService.setOrcid(data.orcid);
      }
    });

    if (this.appSettingsService.myDataSettings.develop) {
      this.profileData = this.testData;
      this.mergePublications(this.profileData[4]);
    } else {
      this.profileService
        .getProfileData()
        .pipe(take(1))
        .subscribe((response) => {
          // Get data from session storage if draft is available
          if (this.appSettingsService.isBrowser) {
            const draft = sessionStorage.getItem(Constants.draftProfile);
            const draftPatchPayload = JSON.parse(
              sessionStorage.getItem(Constants.draftPatchPayload)
            );
            const draftPublicationPatchPayload = JSON.parse(
              sessionStorage.getItem(Constants.draftPublicationPatchPayload)
            );

            this.draftPayload = draftPatchPayload;

            // Display either draft profile or profile from database
            if (draft) {
              const parsedDraft = JSON.parse(draft);
              this.draftService.saveDraft(parsedDraft);
              this.profileData = parsedDraft;
            } else {
              this.profileData = response.profileData;
            }

            // Set draft patch payload from storage
            if (draftPatchPayload) {
              this.patchService.addToPatchItems(draftPatchPayload);
              this.patchService.confirmPatchItems();
            }

            // Set draft publication patch payload from storage
            if (draftPublicationPatchPayload) {
              this.publicationsService.addToPayload(
                draftPublicationPatchPayload
              );
              this.publicationsService.confirmPayload();
            }
          }

          // Set original data
          this.profileService.setCurrentProfileData(
            cloneDeep(response.profileData)
          );

          // Merge publications
          // this.(
          //   response.profileData.find((item) => item.id === 'publication')
          // );
        });
    }
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

  doDialogAction(event) {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;

    if (event === 'publish') {
      this.publish();
    }

    if (event === 'delete') {
      this.deleteProfile();
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

  publish() {
    // TODO: Forkjoin both HTTP requests and handle results as single
    this.handlePublications();
    this.patchItems();
    this.profileService.setCurrentProfileData(this.profileData);
  }

  reset() {
    sessionStorage.removeItem(Constants.draftProfile);
    sessionStorage.removeItem(Constants.draftPatchPayload);
    sessionStorage.removeItem(Constants.draftPublicationPatchPayload);
    this.profileData = [...this.profileService.currentProfileData];
    this.clearDraftData();
  }

  clearDraftData() {
    this.patchService.clearPatchItems();
    this.patchService.cancelConfirmedPatchPayload();
    this.publicationsService.clearPayload();
    this.publicationsService.cancelConfirmedPayload();
    this.draftService.clearData();
  }

  /*
   * Add selected publications to profile
   */
  handlePublications() {
    this.publicationsService
      .addPublications()
      .pipe(take(1))
      .subscribe((result) => {});
  }

  /*
   * Patch items to backend
   */
  patchItems() {
    const patchItems = this.patchService.confirmedPatchItems;

    this.profileService
      .patchObjects(patchItems)
      .pipe(take(1))
      .subscribe(
        (result) => {
          this.snackbarService.show(
            'Profiili julkaistu. Tiedot näkyvät muutaman minuutin kuluttua tiedejatutkimus.fi -palvelussa.',
            'success'
          );
          this.clearDraftData();
        },
        (error) => {
          this.snackbarService.show('Virhe tiedon tallennuksessa', 'error');
        }
      );
  }
}
