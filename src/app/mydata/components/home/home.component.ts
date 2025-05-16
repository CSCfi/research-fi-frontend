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
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '@shared/services/notification.service';
import { DialogEventsService } from '@shared/services/dialog-events.service';
import { SecondaryButtonComponent } from '../../../shared/components/buttons/secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from '../../../shared/components/buttons/primary-action-button/primary-action-button.component';
import { BannerDividerComponent } from '@shared/components/banner-divider/banner-divider.component';
import { map, take } from 'rxjs/operators';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
  imports: [
    PrimaryActionButtonComponent,
    RouterLink,
    SecondaryButtonComponent,
    BannerDividerComponent
  ]
})
export class HomeComponent implements OnInit {
  title = $localize`:@@home:Etusivu`;
  homeWelcomeCaption = $localize`:@@homeWelcomeCaption:Kokoa tiedoistasi julkinen profiili Tiedejatutkimus.fi-palveluun`;
  homeWelcomeText = $localize`:@@homeWelcomeText:Tutkijan tiedot -työkalun avulla yhdistelet julkisen profiilin Tiedejatutkimus.fi -palveluun ORCID-palvelun sisältämistä sekä kotiorganisaatiostasi peräisin olevista tiedoistasi. Työkalussa voit esikatsella tietoja ennen niiden julkaisua ja valita profiiliisi vain ne tiedot, jotka haluat osaksi profiiliasi.`;
  alreadyCreatedProfile = $localize`:@@alreadyCreatedProfile:Oletko jo luonut profiilin tähän palveluun?`;
  additionalInfoText = $localize`:@@additionalInfo:Lisätietoa` + ':';

  suomiFiAutheticationProblemSnackbarText = $localize`:@@suomiFiAutheticationProblemSnackbarText:Osalla käyttäjistä on ilmennyt virhetilanne Suomi.fi-tunnistautumisen jälkeen, joka estää pääsyn profiilin luontiin. Mikäli virhetilanne ilmenee, kirjautumista pääsee jatkamaan klikkaamalla "Kirjaudu sisään" -painiketta sivun ylälaidassa.`;

  locale: string;

  constructor(
    public oidcSecurityService: OidcSecurityService,
    private utilityService: UtilityService,
    private appSettingsService: AppSettingsService,
    private router: Router,
    private notificationService: NotificationService,
    private dialogEventsService: DialogEventsService
  ) {}

  ngOnInit() {
    this.utilityService.setMyDataTitle(this.title);
    this.locale = this.appSettingsService.currentLocale;


      this.oidcSecurityService.isAuthenticated$.pipe(
        take(1),
        map(({ isAuthenticated }) => {
          // allow navigation if authenticated
          if (isAuthenticated) {
            console.log('IS AUTH', isAuthenticated);
          }
        })
      );



    // BANNER THAT WAS USED TO INFORM USERS REGARDING THE PROBLEM WITH SUOMI.FI AUTHENTICATION
    /*this.notificationService.notify({
      notificationText: this.suomiFiAutheticationProblemSnackbarText,
      buttons: [
        {
          label: $localize`:@@close:Sulje`,
          action: () => this.notificationService.clearNotification(),
        },
      ],
    });*/

  }

  login() {
    this.oidcSecurityService.authorize();
  }

  showWelcomeModal() {
    this.dialogEventsService.setQuickstartState(true);
  }
}
