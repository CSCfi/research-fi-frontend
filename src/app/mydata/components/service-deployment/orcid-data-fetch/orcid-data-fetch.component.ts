import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Subscription, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-orcid-data-fetch',
  templateUrl: './orcid-data-fetch.component.html',
  styleUrls: ['./orcid-data-fetch.component.scss'],
})
export class OrcidDataFetchComponent implements OnInit, OnDestroy {
  loading = false;
  IDPLinkSub: Subscription;
  orcid: string;
  createProfileSub: Subscription;
  accountLinkSub: Subscription;

  constructor(
    private profileService: ProfileService,
    private oidcSecurityService: OidcSecurityService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.IDPLinkSub = this.profileService
      .accountlink()
      .pipe(switchMap(() => this.oidcSecurityService.forceRefreshSession()))
      .subscribe(() => {
        const idTokenPayload = this.oidcSecurityService.getPayloadFromIdToken();
        this.orcid = idTokenPayload.orcid;
        this.profileService.setUserData(idTokenPayload);
      });
  }

  fetchOrcidData() {
    if (!this.orcid) {
      this.profileService.handleOrcidNotLinked();
    } else {
      this.accountLinkSub = this.profileService
        .accountlink()
        .subscribe((response: { body: { success: string } }) => {
          if (response.body.success) {
            this.loading = true;
            this.createProfile();
          } else {
            console.error('Unable to link ORCID');
          }
        });
    }
  }

  // Create profile when proceeding from step 4. Get ORCID data after profile creation
  createProfile() {
    this.createProfileSub = this.profileService
      .createProfile()
      .pipe(take(1))
      .subscribe((data: any) => {
        if (data.ok) {
          this.getOrcidData();
        } else {
          // TODO: Alert problem
        }
      });
  }

  async getOrcidData() {
    const response: any = await this.profileService.getOrcidData().toPromise();
    if (response.ok) {
      this.dialog.closeAll();
      this.loading = false;
      this.router.navigate(['/mydata/profile']);
    }
  }

  ngOnDestroy(): void {
    this.IDPLinkSub?.unsubscribe();
    this.createProfileSub?.unsubscribe();
    this.accountLinkSub?.unsubscribe();
  }
}
