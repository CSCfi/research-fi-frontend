import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
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

  ngOnInit(): void {}

  orcidDataFetchWaitingText = $localize`:@@orcidDataFetchWaitingText:Tietoja tuodaan, odota hetki...`;
  orcidDataFetchInfo1 = $localize`:@@orcidDataFetchInfo1:Tutkijan profiilipalvelun käyttöönotto edellyttää, että ORCID -palveluun tallentamasi julkiset tiedot tallennetaan profiilipalveluun.`;
  orcidDataFetchInfo2 = $localize`:@@orcidDataFetchInfo2:Valitsemalla “Tuo ORCID-tietoni” annat luvan ORCID:iin tallentamiesi julkisten tietojesi tallentamiseen Tutkijan profiilipalveluun.`;
  orcidDataFetchInfo3 = $localize`:@@orcidDataFetchInfo3:Tässä vaiheessa emme vielä julkaise profiiliasi.`;
  orcidDataFetchInfo4 = $localize`:@@orcidDataFetchInfo4:Voit hallinnoida tietojesi julkisuutta seuraavaksi aukeavassa profiilieditorissa.`;


  // Create profile when proceeding from step 4. Get ORCID data after profile creation
  async createProfile() {
    this.profileService
      .createProfile().then(
      (value) => {
        this.loading = true;
        this.getOrcidData();
      },
      (reason) => {
        console.error(reason);
      },);
  }

  async fetchOrcidData() {
    if (!this.orcid) {
      this.profileService.handleOrcidNotLinked();
    } else {
      this.profileService
        .accountlink().then(
        (value) => {
          this.loading = true;
          this.createProfile();
        },
        (reason) => {
          console.error(reason);
          console.error('Unable to link ORCID');
        },);
    }
  }

  async getOrcidData() {
    const response: any = await this.profileService.getOrcidData();
    if (response.success) {
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
