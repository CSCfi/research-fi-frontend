import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { UtilityService } from '@shared/services/utility.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { SecondaryButtonComponent } from '../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { BannerDividerComponent } from '@shared/components/banner-divider/banner-divider.component';

@Component({
    selector: 'app-cancel-deployment',
    templateUrl: './cancel-deployment.component.html',
    standalone: true,
  imports: [
    NgIf,
    MatProgressSpinner,
    SecondaryButtonComponent,
    BannerDividerComponent
  ]
})
export class CancelDeploymentComponent implements OnInit {
  previousStep: number;
  loading = false;

  constructor(
    private router: Router,
    private utilityService: UtilityService,
    private oidcSecurityService: OidcSecurityService,
    private profileService: ProfileService
  ) {
    // Look for previous step
    this.previousStep =
      this.router.getCurrentNavigation().previousNavigation?.finalUrl.queryParams?.step;
  }

  ngOnInit(): void {
    this.utilityService.setMyDataTitle(
      $localize`:@@cancelServiceDeployment:Peruutetaanko palvelun käyttöönotto?`
    );
  }

  cancelDeployment() {
    this.loading = true;
    this.oidcSecurityService.getAccessToken().subscribe(
      token => {
        if (token) {
          this.profileService
            .deleteAccount().then(
            (value) => {
              this.oidcSecurityService.logoff();
            },
            (reason) => {
              console.error(reason);
            },);
        } else {
          this.router.navigate(['/mydata']);
        }
      }
    );

  }

  continueDeployment() {
    this.router.navigate(['/mydata/service-deployment'], {
      queryParams: { step: this.previousStep ? this.previousStep : 1 },
    });
  }
}
