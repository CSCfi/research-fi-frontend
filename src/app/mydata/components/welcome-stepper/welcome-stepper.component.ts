import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper'
import { FormBuilder, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

@Component({
  selector: 'app-welcome-stepper',
  templateUrl: './welcome-stepper.component.html',
  styleUrls: ['./welcome-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class WelcomeStepperComponent implements OnInit {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });

  @Output() onModalAction = new EventEmitter<any>();

  showModal = true;
  localizedTitle = 'Miten Tutkijan tiedot -palvelu toimii?';
  localizedDialogActions = [
    { label: $localize`:@@closeInstructions:Sulje ohjeet`, primary: false, method: 'close' },
    { label: $localize`:@@createProfile:Luo profiili`, primary: true, method: 'createProfile' },
  ];
  localizedStepCaptions = [$localize`:@@welcomeStepperStep1Caption:Aloita työkalun käyttö vahvalla Suomi.fi-tunnistautumisella sekä kirjautumalla ORCID-tunnuksillasi.`,
    $localize`:@@welcomeStepperStep2Caption:Kokoa julkisessa profiilissasi näytettävät tiedot.`,
    $localize`:@@welcomeStepperStep3Caption:Kun päivität tietojasi ORCID-palvelussa tai kotiorganisaatiossasi, myös profiiliisi valitsemasi tiedot päivittyvät automaattisesti.`,
    $localize`:@@welcomeStepperStep4Caption:Esikatsele julkiseen profiiliisi lisäämiäsi tietoja ennen niiden julkaisemista.`,
    $localize`:@@welcomeStepperStep5Caption:Jaa halutessasi profiilisi tietoja myös muille tutkimustoimijoille.`,
    $localize`:@@welcomeStepperStep6Caption:Valmista!`,
    ];

  localizedStepContent = [$localize`:@@welcomeStepperStep1Caption:Suomi.fi-tunnistautumisen avulla vahvistamme henkilöllisyytesi. ORCID-tunnisteen avulla voit koota profiiliisi tiedot eri lähteistä.`,
    $localize`:@@welcomeStepperStep2Content1:Kun olet kirjautunut, voit valita, mitkä ORCID-tunnisteeseesi yhdistetyt tiedot haluat asettaa julkiseksi profiilissasi. Voit liittää profiiliin tietoja ORCID-palvelusta löytyvien tietojen lisäksi myös oman kotiorganisaatiosi tiedoista. Sinun tarvitsee vain valita julkiseksi asetettavat tiedot. Työkaluun ei ole mahdollista syöttää tietoja itse.`,
    $localize`:@@welcomeStepperStep2Content2:Tutkijan tiedot -työkalun beta-versiossa on saatavilla vain rajoitetusti organisaatioista siirrettyjä tietoja. Jos et löydä tämänhetkisestä kotiorganisaatiostasi peräisin olevia tietoja, johtuu se siitä, että organisaatiosi ei ole vielä tehnyt tarvittavia tiedonsiirtoja.`,
    $localize`:@@welcomeStepperStep3Content1:Jos haluat muokata alkuperäisiä tietojasi, tee se tiedon alkuperäisessä lähteessä (kotiorganisaation järjestelmä, ORCID-palvelu). Tiedot päivittyvät profiiliisi automaattisesti.`,
    $localize`:@@welcomeStepperStep3Content2:Huom. Jos lisäät ORCID-palvelussa uusia tietoja (esim. julkaisuja) profiilin luomisen jälkeen, ne eivät vielä nykyisessä beta-versiossa päivity profiiliisi automaattisesti. Tämä ominaisuus otetaan käyttöön keväällä 2023 julkaistavassa versiossa.`,
    $localize`:@@welcomeStepperStep4Content:Kun olet valinnut haluamasi tiedot, voit esikatsella profiiliasi muokkausnäkymässä. Vasta profiilin julkaisemisen jälkeen profiiliin tiedot näkyvät Tiedejatutkimus.fi-portaalissa.`,
    $localize`:@@welcomeStepperStep5Content:Vuoden 2023 aikana kehitämme toiminnallisuutta profiilitietojesi jakamiseen halutessasi sellaisille  tutkimusrahoittajille, kotiorganisaatiollesi ja muille yhteistyökumppaneille, joilla on valmius tietojen hyödyntämiseen omassa järjestelmässään. Tämä ei ole vielä mahdollista nykyisessä beta-versiossa.`,
    $localize`:@@welcomeStepperStep6Content:Profiilisi on nyt löydettävissä Tiedejatutkimus.fi-sivustolla, josta mm. tiedotusvälineet, rahoittajat, tutkimusyhteistyöstä kiinnostuneet sekä muut tutkimustiedon etsijät voivat löytää profiilisi!`,
  ];

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  doDialogAction(action: string) {
    switch (action) {
      case 'createProfile': {
        this.onModalAction.emit('createProfile');
      }
      default: {
        this.onModalAction.emit('close');
      }
    }
  }
}
