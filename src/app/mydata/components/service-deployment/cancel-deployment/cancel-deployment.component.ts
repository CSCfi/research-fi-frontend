import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { UtilityService } from '@shared/services/utility.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs';

@Component({
  selector: 'app-cancel-deployment',
  templateUrl: './cancel-deployment.component.html',
})
export class CancelDeploymentComponent implements OnInit {
  previousStep: number;
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
    const token = this.oidcSecurityService.getAccessToken();

    const navigate = () => this.router.navigate(['/mydata']);

    if (token) {
      this.profileService
        .deleteAccount()
        .pipe(take(1))
        .subscribe((res: HttpResponse<any>) => {
          if (res.ok) {
            navigate();
          }
        });
    } else {
      navigate();
    }
  }

  continueDeployment() {
    this.router.navigate(['/mydata/service-deployment'], {
      queryParams: { step: this.previousStep ? this.previousStep : 1 },
    });
  }
}
