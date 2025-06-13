//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { CollaborationsService } from '@mydata/services/collaborations.service';
import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { Constants } from '@mydata/constants';
import { Subscription } from 'rxjs';
import { DialogComponent } from '../../../../../shared/components/dialog/dialog.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { EmptyCardComponent } from '../empty-card/empty-card.component';
import { NgIf, NgFor, JsonPipe } from '@angular/common';
import { ProfileEditorCardHeaderComponent } from '../profile-editor-card-header/profile-editor-card-header.component';
import {
  CollaborationViewComponent
} from '@mydata/components/shared-layouts/collaboration-view/collaboration-view.component';

@Component({
  selector: 'app-collaboration-card',
  templateUrl: './collaboration-card.component.html',
  styleUrls: ['./collaboration-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    ProfileEditorCardHeaderComponent,
    NgIf,
    EmptyCardComponent,
    NgFor,
    MatCheckbox,
    DialogComponent,
    CollaborationViewComponent,
    JsonPipe
  ]
})
export class CollaborationCardComponent implements OnInit {
  @Input() label: string;
  @Input() data: any;
  @Input() editControlsVisible: boolean;

  originalCollaborationOptions;
  collaborationOptions = [];
  showDialog: boolean;
  hasCheckedOption: boolean = true;

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
    const collabFields = this.data.filter(item => item.id === 'cooperation');
    this.collaborationOptions = collabFields[0].fields;
  }

  openDialog() {
    this.showDialog = true;
  }

  doDialogAction(action: string) {
    console.log('doing dialog action', action);
    this.dialog.closeAll();
    this.showDialog = false;

    if (action) {
      this.optionsToggled.forEach((option) => {
        const match = this.collaborationOptions.findIndex(
          (item) => item.id === option.id
        );

        this.collaborationOptions[match].selected = option.selected;
      });

      this.collaborationsService.addToPayload(this.optionsToggled);
      this.collaborationsService.confirmPayload();
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
