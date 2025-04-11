import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { OrcidComponent } from '../../../shared/components/orcid/orcid.component';
import { SecondaryButtonComponent } from '../../../shared/components/buttons/secondary-button/secondary-button.component';
import { OrcidDataFetchComponent } from './orcid-data-fetch/orcid-data-fetch.component';
import { OrcidLoginComponent } from './orcid-login/orcid-login.component';
import { ServiceTermsComponent } from './service-terms/service-terms.component';
import { PrimaryActionButtonComponent } from '../../../shared/components/buttons/primary-action-button/primary-action-button.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { BannerDividerComponent } from '@shared/components/banner-divider/banner-divider.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

type Step = { label: string; icon: string; loading?: boolean };
@Component({
  selector: 'app-service-deployment',
  templateUrl: './service-deployment.component.html',
  styleUrls: ['./service-deployment.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatProgressSpinner,
    NgSwitch,
    NgSwitchCase,
    PrimaryActionButtonComponent,
    ServiceTermsComponent,
    OrcidLoginComponent,
    OrcidDataFetchComponent,
    SecondaryButtonComponent,
    RouterLink,
    OrcidComponent,
    BannerDividerComponent,
    SvgSpritesComponent
  ]
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
      icon: 'fa-handshake',
    },
    {
      label: $localize`:@@termsPersonalDataProcessing:Käyttöehdot ja henkilötietojen käsittely`,
      icon: 'fa-file-alt',
    },
    {
      label: $localize`:@@serviceDeploymentAuthenticationSucceful:Tunnistautuminen onnistui`,
      icon: 'fa-handshake',
    },
    {
      label: $localize`:@@serviceDeploymentOrcidLoginSuccesful:ORCID-kirjautuminen onnistui`,
      icon: 'download',
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
