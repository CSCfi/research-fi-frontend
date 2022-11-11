import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-orcid-data-fetch',
  templateUrl: './orcid-data-fetch.component.html',
  styleUrls: ['./orcid-data-fetch.component.scss'],
})
export class OrcidDataFetchComponent implements OnInit, OnDestroy {
  @Input() userData: any;
  @Input() orcid: string;

  configLoading = true;
  loading = false;

  createProfileSub: Subscription;
  accountLinkSub: Subscription;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('orcid:', this.orcid);
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
    this.createProfileSub?.unsubscribe();
    this.accountLinkSub?.unsubscribe();
  }
}
