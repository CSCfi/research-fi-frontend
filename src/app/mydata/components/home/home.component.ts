//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { UtilityService } from '@shared/services/utility.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  title = $localize`:@@home:Etusivu`;
  homeWelcomeCaption = $localize`:@@homeWelcomeCaption:Kokoa tiedoistasi julkinen profiili Tiedejatutkimus.fi-palveluun`;
  homeWelcomeText = $localize`:@@homeWelcomeText:Tutkijan tiedot -työkalun avulla yhdistelet julkisen profiilin Tiedejatutkimus.fi -palveluun ORCID-palvelun sisältämistä sekä kotiorganisaatiostasi peräisin olevista tiedoistasi. Työkalussa voit esikatsella tietoja ennen niiden julkaisua ja valita profiiliisi vain ne tiedot, jotka haluat osaksi profiiliasi.<`;
  alreadyCreatedProfile = $localize`:@@alreadyCreatedProfile:Oletko jo luonut profiilin tähän palveluun?`;
  additionalInfoText = $localize`:@@additionalInfo:Lisätietoa` + ':';


  locale: string;
  showStepperModal = false;

  constructor(
    public oidcSecurityService: OidcSecurityService,
    private utilityService: UtilityService,
    private appSettingsService: AppSettingsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.utilityService.setMyDataTitle(this.title);
    // Fallback until we get swedish visualization
    this.locale =
      this.appSettingsService.currentLocale === 'sv'
        ? 'en'
        : this.appSettingsService.currentLocale;
  }

  login() {
    this.oidcSecurityService.authorize();
  }

  showWelcomeModal() {
    this.showStepperModal = true;
  }

  handleWelcomeModalAction(event: string) {
    this.showStepperModal = false;
    if (event === 'createProfile') {
      this.router.navigate(['mydata/service-deployment']);
    }
  }
}
