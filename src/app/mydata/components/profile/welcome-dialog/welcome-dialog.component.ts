import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';

@Component({
    selector: 'app-welcome-dialog',
    templateUrl: './welcome-dialog.component.html',
    imports: [DialogComponent]
})
export class WelcomeDialogComponent implements OnInit {
  showDialog = true;

  startManagingYourProfileText = $localize`:@@startManagingYourProfile:Voit aloittaa Tutkijan tiedot -profiilin hallinnoinnin.`;
  serviceDeploymentSuccessful = $localize`:@@serviceDeploymentSuccesful:Profiilityökalun käyttöönotto onnistui`;

  dialogActions = [
    {
      label: $localize`:@@continue:Jatka`,
      primary: true,
      method: 'close',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
