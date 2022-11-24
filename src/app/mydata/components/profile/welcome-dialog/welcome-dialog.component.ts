import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
})
export class WelcomeDialogComponent implements OnInit {
  showDialog = true;

  startManagingYourProfileText = $localize`:@@startManagingYourProfile:Voit aloittaa Tutkijan tiedot -profiilin hallinnoinnin.`;

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
