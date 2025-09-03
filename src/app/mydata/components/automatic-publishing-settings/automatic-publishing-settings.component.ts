import { Component } from '@angular/core';
import { FixExternalUrlPipe } from '@portal/pipes/fix-external-url.pipe';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
  selector: 'app-automatic-publishing-settings',
  standalone: true,
  imports: [
    FixExternalUrlPipe,
    SvgSpritesComponent
  ],
  templateUrl: './automatic-publishing-settings.component.html',
  styleUrl: './automatic-publishing-settings.component.scss'
})
export class AutomaticPublishingSettingsComponent {

  automaticPublishingIsPossible = $localize`:@@automaticPublishingIsPossible:Tietojen automaattinen julkaiseminen on nyt mahdollista`;
  automaticPublsihingInfoText1 = $localize`:@@automaticPublsihingInfoText1:Tietolähteissä tehdyt muutokset voidaan julkaista automaattisesti profiilissasi.`;
  automaticPublsihingInfoTextBullet1 = $localize`:@@automaticPublsihingInfoTextBullet1:Tutkimustoiminnan kuvaus ja osa yhteystiedoista eivät kuulu automaattisen julkaisun piiriin.`;
  automaticPublsihingInfoTextBullet2 = $localize`:@@automaticPublsihingInfoTextBullet2:Katso tarkempi määrittely`;

  automaticPublsihingInfoTextBullet2Link = 'https://wiki.eduuni.fi/x/cbJqJ';

  automaticPublishingCheckboxLabel1 = $localize`:@@automaticPublishingCheckboxLabel:Julkaise päivittyneet tiedot automaattisesti. Tietolähteet: Tiedejatutkimus.fi ja ORCID`;
  automaticPublishingCheckboxLabel2 = $localize`:@@automaticPublishingCheckboxLabel2:Tietolähteet: Tiedejatutkimus.fi ja ORCID`;

  automaticPublishingCheckboxActiveAdditionalInfo = $localize`:@@automaticPublishingCheckboxActiveAdditionalInfo:Koska tietolähteitä on kaksi, profiilissasi saattaa ilmetä joitakin kaksoiskappaleita esimerkiksi aktiviteetti-tiedostoista. Pystyt piilottamaan kaksoiskappaleet manuaalisesti profiilissasi.`;

  ngOnInit(): void {

  }

}
