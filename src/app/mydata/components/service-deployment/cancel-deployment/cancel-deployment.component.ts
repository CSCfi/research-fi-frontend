import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-cancel-deployment',
  templateUrl: './cancel-deployment.component.html',
})
export class CancelDeploymentComponent implements OnInit {
  previousStep: number;
  constructor(private router: Router, private utilityService: UtilityService) {
    // Look for previous step
    this.previousStep =
      this.router.getCurrentNavigation().previousNavigation?.finalUrl.queryParams?.step;
  }

  ngOnInit(): void {
    this.utilityService.setMyDataTitle(
      $localize`:@@cancelServiceDeployment:Peruutetaanko palvelun käyttöönotto?`
    );
  }

  continueDeployment() {
    this.router.navigate(['/mydata/service-deployment'], {
      queryParams: { step: this.previousStep ? this.previousStep : 1 },
    });
  }
}
