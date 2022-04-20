import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';
import {
  faHandshakeAlt,
  faFileAlt,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-service-deployment',
  templateUrl: './service-deployment.component.html',
  styleUrls: ['./service-deployment.component.scss'],
})
export class ServiceDeploymentComponent implements OnInit, OnDestroy {
  step: number;
  title = $localize`:@@serviceDeployment:Palvelun käyttöönotto`;
  textContent: string;
  locale: string;
  cancel = false;
  queryParamsSub: Subscription;
  userDataSub: Subscription;
  userData: any;

  steps = [
    { label: 'Luo Tutkijan tiedot -profiili', icon: faHandshakeAlt },
    { label: 'Käyttöehdot ja henkilötietojen käsittely', icon: faFileAlt },
    { label: 'Tunnistautuminen onnistui', icon: faHandshakeAlt },
    { label: 'Orcid-kirjautuminen onnistui', icon: faDownload },
  ];

  constructor(
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private appSettingsService: AppSettingsService,
    private router: Router,
    private profileService: ProfileService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    // Initialize step
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      this.step = Number(params.step) || 1;

      this.utilityService.setMyDataTitle(
        `${this.steps[this.step - 1].label} | ${this.title}`
      );
    });

    // Get page content from CMS data
    this.textContent = this.route.snapshot.data.pages.find(
      (page) => page.id === 'mydata_create_profile'
    )['content' + this.locale];

    this.userDataSub = this.profileService.userData.subscribe(
      (userData) => (this.userData = userData)
    );
  }

  changeStep(step: number) {
    this.step = step;
    this.router.navigate([], { queryParams: { step: step } });
  }

  toggleCancel(): void {
    this.cancel = !this.cancel;
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
    this.userDataSub?.unsubscribe();
  }
}
