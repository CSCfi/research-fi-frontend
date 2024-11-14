import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatStepperModule, MatStepper, MatStep, MatStepLabel, MatStepContent } from '@angular/material/stepper'
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location, AsyncPipe } from "@angular/common";
import { DialogEventsService } from '@shared/services/dialog-events.service';
import { DialogAction } from '../../../../types';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
    selector: 'app-welcome-stepper',
    templateUrl: './welcome-stepper.component.html',
    styleUrls: ['./welcome-stepper.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatStepper,
        MatStep,
        MatStepLabel,
        MatStepContent,
        DialogComponent,
        AsyncPipe,
    ],
})

export class WelcomeStepperComponent implements OnInit {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });

  localizedTitle = $localize`:@@welcomeStepperHowItWorksCaption:Miten Tutkijan tiedot -työkalu toimii?`;

  isAuthenticated$ = this.oidcSecurityService.isAuthenticated$.pipe(map((authResult) => authResult.isAuthenticated));

  localizedDialogActions$ = this.isAuthenticated$.pipe(map(isAuthenticated => {
    if (isAuthenticated) {
      return [
        { label: $localize`:@@closeInstructions:Sulje ohjeet`, primary: false, method: 'close' }
      ];
    } else {
      return [
        { label: $localize`:@@closeInstructions:Sulje ohjeet`, primary: false, method: 'close' },
        { label: $localize`:@@createProfile:Luo profiili`, primary: true, method: 'createProfile' }
      ];
    }
  }));

  localizedStepCaptions = [$localize`:@@welcomeStepperStep1Caption:Aloita työkalun käyttö vahvalla Suomi.fi-tunnistautumisella sekä kirjautumalla ORCID-tunnuksillasi.`,
    $localize`:@@welcomeStepperStep2Caption:Kokoa julkisessa profiilissasi näytettävät tiedot.`,
    $localize`:@@welcomeStepperStep3Caption:Kun päivität tietojasi ORCID-palvelussa tai kotiorganisaatiossasi, myös profiiliisi valitsemasi tiedot päivittyvät automaattisesti.`,
    $localize`:@@welcomeStepperStep4Caption:Esikatsele julkiseen profiiliisi lisäämiäsi tietoja ennen niiden julkaisemista.`,
    $localize`:@@welcomeStepperStep5Caption:Jaa halutessasi profiilisi tietoja myös muille tutkimustoimijoille.`,
    $localize`:@@welcomeStepperStep6Caption:Valmista!`,
  ];

  localizedStepContent = [$localize`:@@welcomeStepperStep1Caption:Suomi.fi-tunnistautumisen avulla vahvistamme henkilöllisyytesi. ORCID-tunnisteen avulla voit koota profiiliisi tiedot eri lähteistä.`,
    $localize`:@@welcomeStepperStep2Content1:Kun olet kirjautunut, voit valita, mitkä ORCID-tunnisteeseesi yhdistetyt tiedot haluat asettaa julkiseksi profiilissasi. Voit liittää profiiliin tietoja ORCID-palvelusta löytyvien tietojen lisäksi myös oman kotiorganisaatiosi tiedoista. Sinun tarvitsee vain valita julkiseksi asetettavat tiedot. Työkaluun ei ole mahdollista syöttää tietoja itse.`,
    $localize`:@@welcomeStepperStep2Content2:Jos et löydä tämänhetkisestä kotiorganisaatiostasi peräisin olevia tietoja, johtuu se siitä, että organisaatiosi ei ole vielä tehnyt tarvittavia tiedonsiirtoja.`,
    $localize`:@@welcomeStepperStep3Content1:Jos haluat muokata alkuperäisiä tietojasi, tee se tiedon alkuperäisessä lähteessä (kotiorganisaation järjestelmä, ORCID-palvelu). Tiedot päivittyvät profiiliisi automaattisesti.`,
    $localize`:@@welcomeStepperStep4Content:Kun olet valinnut haluamasi tiedot, voit esikatsella profiiliasi muokkausnäkymässä. Vasta profiilin julkaisemisen jälkeen profiiliin tiedot näkyvät Tiedejatutkimus.fi-portaalissa.`,
    $localize`:@@welcomeStepperStep5Content:Vuoden 2023 aikana kehitämme toiminnallisuutta profiilitietojesi jakamiseen halutessasi sellaisille tutkimusrahoittajille, kotiorganisaatiollesi ja muille yhteistyökumppaneille, joilla on valmius tietojen hyödyntämiseen omassa järjestelmässään. Tämä ei ole vielä mahdollista nykyisessä versiossa.`,
    $localize`:@@welcomeStepperStep6Content:Profiilisi on nyt löydettävissä Tiedejatutkimus.fi-sivustolla, josta mm. tiedotusvälineet, rahoittajat, tutkimusyhteistyöstä kiinnostuneet sekä muut tutkimustiedon etsijät voivat löytää profiilisi!`,
  ];

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private dialogEvents: DialogEventsService,
    private oidcSecurityService: OidcSecurityService,
    private router: Router,
  ) {}

  ngOnInit(): void {
  }

  doDialogAction(action: string) {
    if (action === 'createProfile') {
      this.router.navigate(['mydata', 'service-deployment']);
    }

    this.dialogEvents.setQuickstartState(false);
  }
}
