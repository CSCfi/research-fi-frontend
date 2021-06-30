import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeleteProfileDialogComponent } from './delete-profile-dialog/delete-profile-dialog.component';

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
        'Olen kiinnostunut toimimaan tieteellisten julkaisujen vertaisarvioiana',
      id: 3,
    },
  ];

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    private router: Router,
    private appSettingsService: AppSettingsService,
    public dialog: MatDialog
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      if (data) this.orcid = data.orcid;
    });

    if (this.appSettingsService.myDataSettings.develop) {
      this.profileData = this.testData;
    } else {
      this.profileService
        .getProfileData()
        .pipe(take(1))
        .subscribe((data) => {
          this.profileData = data;
        });
    }
  }

  openDeleteProfileDialog(): void {
    this.dialog.open(DeleteProfileDialogComponent, {
      minWidth: '44vw',
    });
  }
}
