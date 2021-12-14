//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from '@mydata/services/profile.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-collaboration-card',
  templateUrl: './collaboration-card.component.html',
  styleUrls: ['./collaboration-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CollaborationCardComponent implements OnInit {
  @Input() label: string;
  @Output() collaborationOptionsChanges = new EventEmitter<any>();
  @Output() collaborationOptionsChanged = new EventEmitter<any>();

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
    private profileService: ProfileService,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.reloadCollaborationChoices();
  }

  public reloadCollaborationChoices() {
    this.nameLocale = 'name' + this.appSettingsService.capitalizedLocale;
    this.profileService
      .getCooperationChoices()
      .pipe(take(1))
      .subscribe((response: any) => {
        this.collaborationOptions = response?.body?.data;
        this.collaborationOptionsChanges.emit(this.collaborationOptions);
        this.collaborationOptions.forEach((item) => {
          if (item?.selected) {
            this.hasCheckedOption = true;
          }
        });
      });
  }

  openDialog() {
    this.showDialog = true;
  }

  doDialogAction(action) {
    this.dialog.closeAll();
    this.showDialog = false;

    if (action === 'save') {
      this.optionsToggled.forEach((index) => {
        const option = this.collaborationOptions[index];
        option.selected = !option.selected;
      });
      this.collaborationOptionsChanges.emit(this.collaborationOptions);
      this.collaborationOptionsChanged.emit(null);
    }

    this.hasCheckedOption = !!this.collaborationOptions.find(
      (option) => option.selected
    );
    this.optionsToggled = [];
  }

  toggleOption(i) {
    this.optionsToggled.push(i);
  }
}
