import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FixExternalUrlPipe } from '@portal/pipes/fix-external-url.pipe';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-automatic-publishing-settings',
  standalone: true,
  imports: [
    FixExternalUrlPipe,
    SvgSpritesComponent,
    MatCheckbox,
    NgIf
  ],
  templateUrl: './automatic-publishing-settings.component.html',
  styleUrl: './automatic-publishing-settings.component.scss'
})
export class AutomaticPublishingSettingsComponent implements OnInit {
  @Input() usedInPublishModal: boolean;
  @Input() isAutomaticPublishingActive: boolean;
  @Output() setAutomaticPublishingActiveState = new EventEmitter<boolean>();

  automaticPublishingIsPossible = $localize`:@@automaticPublishingIsPossible:Tietojen automaattinen julkaiseminen on nyt mahdollista`;


  automaticPublishingAccountSettingsInfoText1 = $localize`:@@automaticPublishingAccountSettingsInfoText1:Kun ominaisuus on valittu, tietolähteissä tehdyt muutokset näkyvät automaattisesti profiilissasi.`;


  automaticPublsihingInfoText1 = $localize`:@@automaticPublsihingInfoText1:Tietolähteissä tehdyt muutokset voidaan julkaista automaattisesti profiilissasi.`;
  automaticPublsihingInfoTextBullet1 = $localize`:@@automaticPublsihingInfoTextBullet1:Tutkimustoiminnan kuvaus ja osa yhteystiedoista eivät kuulu automaattisen julkaisun piiriin.`;
  automaticPublsihingInfoTextBullet2 = $localize`:@@automaticPublsihingInfoTextBullet2:Katso tarkempi määrittely`;

  automaticPublsihingInfoTextBullet2Link = 'https://wiki.eduuni.fi/x/cbJqJ';

  automaticPublishingCheckboxLabel1 = $localize`:@@automaticPublishingCheckboxLabel:Julkaise päivittyneet tiedot automaattisesti.`;
  automaticPublishingCheckboxLabel2 = $localize`:@@automaticPublishingCheckboxLabel2:Tietolähteet: Tiedejatutkimus.fi ja ORCID`;

  automaticPublishingCheckboxActiveAdditionalInfo = $localize`:@@automaticPublishingCheckboxActiveAdditionalInfo:Koska tietolähteitä on kaksi, profiilissasi saattaa ilmetä joitakin kaksoiskappaleita esimerkiksi aktiviteetti-tiedostoista. Pystyt piilottamaan kaksoiskappaleet manuaalisesti profiilissasi.`;
  isChecked: boolean = false;

  ngOnInit() {
    this.isChecked = this.isAutomaticPublishingActive;
  }

  valueChange(event: any){
    this.setAutomaticPublishingActiveState.emit(event.checked);
    this.isChecked = event.checked
  }

}
