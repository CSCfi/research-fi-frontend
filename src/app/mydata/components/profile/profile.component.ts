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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit {
  profileData: any;
  testData: any;
  orcid: string;

  mergePublications = mergePublications;

  collaborationOptions = [
    { label: 'Olen kiinnostunut tiedotusvälineiden yhteydenotoista', id: 0 },
    {
      label:
        'Olen kiinnostunut yhteistyöstä muiden tutkijoiden ja tutkimusryhmien kanssa',
      id: 1,
    },
    { label: 'Olen kiinnostunut yhteistyöstä yritysten kanssa', id: 2 },
    {
      label:
        'Olen kiinnostunut toimimaan tieteellisten julkaisujen vertaisarvioijana',
      id: 3,
    },
  ];

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle: any;
  currentDialogActions: any[];
  basicDialogActions = [{ label: 'Sulje', primary: true, method: 'close' }];
  deleteProfileDialogActions = [
    { label: 'Peruuta', primary: false, method: 'close' },
    { label: 'Poista profiili', primary: true, method: 'delete' },
  ];
  @ViewChild('deletingProfileTemplate') deletingProfileTemplate: ElementRef;

  connProblem: boolean;
  loading: boolean;
  deletingProfile: boolean;

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    private appSettingsService: AppSettingsService,
    public draftService: DraftService,
    private patchService: PatchService,
    public dialog: MatDialog,
    private router: Router,
    private snackbarService: SnackbarService
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      if (data) {
        this.orcid = data.orcid;
        this.appSettingsService.setOrcid(data.orcid);
      }
    });

    if (this.appSettingsService.myDataSettings.develop) {
      this.profileData = this.testData;
      this.mergePublications(this.profileData.profileData[4]);
    } else {
      this.profileService
        .getProfileData()
        .pipe(take(1))
        .subscribe((data) => {
          this.profileData = data;

          // Merge publications
          // TODO: Find better way to pass array element than index number. Eg. type
          this.mergePublications(data.profileData[4]);
        });
    }
  }

  openDialog(title, template, actions) {
    this.dialogTitle = title;
    this.showDialog = true;
    this.dialogTemplate = template;
    this.currentDialogActions = actions;
  }

  doDialogAction(event) {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;

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
  }

  publish() {
    const currentPatchItems = this.patchService.currentPatchItems;
    this.patchItems(currentPatchItems);
  }

  /*
   * Patch items to backend
   */
  patchItems(patchItems) {
    this.profileService
      .patchObjects(patchItems)
      .pipe(take(1))
      .subscribe(
        (result) => {
          this.snackbarService.show('Muutokset tallennettu', 'success');
          this.patchService.clearPatchPayload();
          this.draftService.clearData();
        },
        (error) => {
          this.snackbarService.show('Virhe tiedon tallennuksessa', 'error');
        }
      );
  }
}
