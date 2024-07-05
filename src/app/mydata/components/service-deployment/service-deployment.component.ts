import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription, switchMap } from 'rxjs';
import {
  faHandshakeAlt,
  faFileAlt,
  faDownload,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { OrcidComponent } from '../../../shared/components/orcid/orcid.component';
import { SecondaryButtonComponent } from '../../../shared/components/buttons/secondary-button/secondary-button.component';
import { OrcidDataFetchComponent } from './orcid-data-fetch/orcid-data-fetch.component';
import { OrcidLoginComponent } from './orcid-login/orcid-login.component';
import { ServiceTermsComponent } from './service-terms/service-terms.component';
import { PrimaryActionButtonComponent } from '../../../shared/components/buttons/primary-action-button/primary-action-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';

type Step = { label: string; icon: IconDefinition; loading?: boolean };
@Component({
    selector: 'app-service-deployment',
    templateUrl: './service-deployment.component.html',
    styleUrls: ['./service-deployment.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        MatProgressSpinner,
        FontAwesomeModule,
        NgSwitch,
        NgSwitchCase,
        PrimaryActionButtonComponent,
        ServiceTermsComponent,
        OrcidLoginComponent,
        OrcidDataFetchComponent,
        SecondaryButtonComponent,
        RouterLink,
        OrcidComponent,
    ],
})
export class ServiceDeploymentComponent implements OnInit, OnDestroy {
  step: number;
  title = $localize`:@@serviceDeployment:Profiilityökalun käyttöönotto - Tutkijan tiedot`;
  textContent: string;
  locale: string;
  cancel = false;
  queryParamsSub: Subscription;
  userDataSub: Subscription;
  userData: any;
  loading = true;
  currentStep: Step;

  openTermsAndProcessingPrinciples = $localize`:@@openTermsAndProcessingPrinciples:Avaa käyttöehdot ja käsittelyperiaatteet`;

  steps: Step[] = [
    {
      label: $localize`:@@serviceDeploymentCreateProfile:Kokoa profiili`,
      icon: faHandshakeAlt,
    },
    {
      label: $localize`:@@termsPersonalDataProcessing:Käyttöehdot ja henkilötietojen käsittely`,
      icon: faFileAlt,
    },
    {
      label: $localize`:@@serviceDeploymentAuthenticationSucceful:Tunnistautuminen onnistui`,
      icon: faHandshakeAlt,
    },
    {
      label: $localize`:@@serviceDeploymentOrcidLoginSuccesful:ORCID-kirjautuminen onnistui`,
      icon: faDownload,
      loading: true,
    },
  ];

  IDPLinkSub: Subscription;
  orcid: string;

  constructor(
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private appSettingsService: AppSettingsService,
    private router: Router,
    private profileService: ProfileService,
    private oidcSecurityService: OidcSecurityService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    // Initialize step
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      this.step = Number(params.step) || 1;

      const current = this.steps[this.step - 1];

      this.utilityService.setMyDataTitle(`${current.label} | ${this.title}`);

      this.currentStep = current;

      // Initialize Identity Provider configuration and enable ORCID data fetch in step 4
      if (this.step === 4) {
        this.profileService
          .accountlink().then(
          (value) => {
            this.IDPLinkSub = this.oidcSecurityService.forceRefreshSession()
              .subscribe(() => {
                this.oidcSecurityService.getPayloadFromIdToken().subscribe(data => {
                  this.orcid = data.orcid;
                  this.profileService.setUserData(data);
                });
              });
          },
          (reason) => {
            console.error(reason);
          },);
      }
    });

    // Get page content from CMS data
    this.textContent = this.route.snapshot.data.pages.find(
      (page) => page.id === 'mydata_create_profile'
    )['content' + this.locale];

    this.userDataSub = this.profileService.userData.subscribe((userData) => {
      this.userData = userData;
      this.handleLoadingIndicator();
    });
  }

  changeStep(step: number) {
    this.step = step;
    this.router.navigate([], { queryParams: { step: step } });
  }

  toggleCancel(): void {
    this.cancel = !this.cancel;
  }

  /*
   * There is a short lag in ORCID - OIDC communication when coming back from ORCID login.
   * Prevent user from fetching ORCID data before configuration is initialized.
   */
  handleLoadingIndicator() {
    if (this.currentStep.loading) {
      this.currentStep.loading = !!!this.userData;
    }
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
    this.userDataSub?.unsubscribe();
    this.IDPLinkSub?.unsubscribe();
  }
}
