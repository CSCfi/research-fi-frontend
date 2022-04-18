import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
})
export class WelcomeDialogComponent implements OnInit {
  showDialog = true;

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
