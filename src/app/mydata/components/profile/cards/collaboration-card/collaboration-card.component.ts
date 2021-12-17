//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { CollaborationsService } from '@mydata/services/collaborations.service';
import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { Constants } from '@mydata/constants';

@Component({
  selector: 'app-collaboration-card',
  templateUrl: './collaboration-card.component.html',
  styleUrls: ['./collaboration-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CollaborationCardComponent implements OnInit {
  @Input() label: string;

  originalCollaborationOptions;
  collaborationOptions = [];
  showDialog: boolean;
  hasCheckedOption: boolean;

  dialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@continue:Jatka`, primary: true, method: 'save' },
  ];
  optionsToggled = [];
  nameLocale = '';

  constructor(
    private dialog: MatDialog,
    private collaborationsService: CollaborationsService,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.nameLocale = 'name' + this.appSettingsService.capitalizedLocale;

    this.fetchCollaborationChoices();
  }

  private fetchCollaborationChoices() {
    this.collaborationsService
      .getCooperationChoices()
      .pipe(take(1))
      .subscribe((response: any) => {
        const options = response?.body?.data;

        this.originalCollaborationOptions = options;

        this.setInitialValue(options);

        // Render selections from storage if draft available
        const draft = sessionStorage.getItem(
          Constants.draftCollaborationPatchPayload
        );

        const draftOptions = draft && JSON.parse(draft);

        if (draftOptions) {
          for (const [i, option] of options.entries()) {
            const match = draftOptions.find(
              (draftOption) => option.id === draftOption.id
            );

            if (match) {
              options[i].selected = match.selected;
            }
          }
        }

        this.collaborationOptions = options;

        this.checkForSelection();
      });
  }

  private setInitialValue(options) {
    this.collaborationsService.setInitialValue(cloneDeep(options));
  }

  public resetInitialValue() {
    this.collaborationOptions = cloneDeep(
      this.collaborationsService.initialValue
    );

    this.checkForSelection();
  }

  openDialog() {
    this.showDialog = true;
  }

  doDialogAction(action) {
    this.dialog.closeAll();
    this.showDialog = false;

    if (action === 'save') {
      this.optionsToggled.forEach((option) => {
        const match = this.collaborationOptions.findIndex(
          (item) => item.id === option.id
        );

        this.collaborationOptions[match].selected = option.selected;
      });

      this.collaborationsService.addToPayload(this.optionsToggled);
    }

    this.checkForSelection();
    this.optionsToggled = [];
  }

  toggleOption(i, event) {
    const selectedOption = this.collaborationOptions[i];

    // Check if selection differs from options saved in profile.
    // Add to payload if new selection.
    if (selectedOption.selected === event.checked) {
      this.optionsToggled = this.optionsToggled.filter(
        (option) => option.id !== selectedOption.id
      );
    } else {
      this.optionsToggled.push({
        ...selectedOption,
        selected: event.checked,
      });
    }
  }

  private checkForSelection() {
    this.hasCheckedOption = !!this.collaborationOptions.find(
      (option) => option.selected
    );
  }
}
