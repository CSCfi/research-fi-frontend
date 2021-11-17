//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-collaboration-card',
  templateUrl: './collaboration-card.component.html',
  styleUrls: ['./collaboration-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CollaborationCardComponent implements OnInit {
  @Input() label: string;
  collaborationOptions = [
    {
      label: $localize`:@@collabMediaContact:Olen kiinnostunut tiedotusvälineiden yhteydenotoista`,
      checked: false,
    },
    {
      label: $localize`:@@collabCooperationResearchers:Olen kiinnostunut yhteistyöstä muiden tutkijoiden ja tutkimusryhmien kanssa`,
      checked: false,
    },
    {
      label: $localize`:@@collabCooperationOrgs:Olen kiinnostunut yhteistyöstä yritysten kanssa`,
      checked: false,
    },
    {
      label: $localize`:@@collabReviewer:Olen kiinnostunut toimimaan tieteellisten julkaisujen vertaisarvioijana`,
      checked: false,
    },
  ];

  showDialog: boolean;
  hasCheckedOption: boolean;

  dialogActions = [
    { label: 'Peruuta', primary: false, method: 'cancel' },
    { label: 'Tallenna', primary: true, method: 'save' },
  ];
  optionsToggled = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  openDialog() {
    this.showDialog = true;
  }

  doDialogAction(action) {
    this.dialog.closeAll();
    this.showDialog = false;

    if (action === 'save') {
      this.optionsToggled.forEach((index) => {
        const option = this.collaborationOptions[index];
        option.checked = !option.checked;
      });
    }

    this.hasCheckedOption = !!this.collaborationOptions.find(
      (option) => option.checked
    );
    this.optionsToggled = [];
  }

  toggleOption(i) {
    this.optionsToggled.push(i);
  }
}
