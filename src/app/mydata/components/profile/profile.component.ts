//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeleteProfileDialogComponent } from './delete-profile-dialog/delete-profile-dialog.component';
import { mergePublications } from '@mydata/utils';
import { Router } from '@angular/router';

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

  deleteProfileDialogRef: MatDialogRef<DeleteProfileDialogComponent>;

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    private appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      if (data) this.orcid = data.orcid;
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

  openDeleteProfileDialog(): void {
    this.deleteProfileDialogRef = this.dialog.open(
      DeleteProfileDialogComponent,
      {
        minWidth: '44vw',
      }
    );

    this.deleteProfileDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.router.navigate(['/mydata']);
        }
      });
  }

  openDialog(title, template) {
    this.dialogTitle = title;
    this.showDialog = true;
    this.dialogTemplate = template;
  }

  resetDialog() {
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
  }
}
