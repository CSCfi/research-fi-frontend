//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';
import { DialogTemplateComponent } from './dialog-template/dialog-template.component';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})
export class DialogComponent implements OnInit {
  @Input() title: string;
  @Input() template: any;
  @Input() actions: any[];
  @Input() extraContentTemplate: any;
  @Input() small: boolean;
  @Input() disableClose: boolean;
  @Output() onDialogClose = new EventEmitter<any>();
  @Output() onActionClick = new EventEmitter<any>();

  dialogRef: MatDialogRef<DialogTemplateComponent>;

  constructor(
    public dialog: MatDialog,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.openDialog();
  }

  openDialog() {
    const dialogSettings = { ...this.appSettingsService.dialogSettings };

    // Separate actions into parent columns.
    let spreadActions = false;

    if (this.actions?.find((action) => action.flexStart)) {
      spreadActions = true;

      this.actions = [
        this.actions.filter((action) => action.flexStart),
        this.actions.filter((action) => !action.flexStart),
      ];
    }

    // Handle size
    if (this.small) {
      dialogSettings.minWidth = 'unset';
      dialogSettings.width = 'unset';
      dialogSettings.maxHeight = 'unset';
      dialogSettings.height = 'unset';
    }

    this.dialogRef = this.dialog.open(DialogTemplateComponent, {
      ...dialogSettings,
      autoFocus: false,
      data: {
        title: this.title,
        template: this.template,
        actions: this.actions,
        extraContentTemplate: this.extraContentTemplate,
        spreadActions: spreadActions,
      },
      disableClose: this.disableClose ? true : false,
    });

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        this.onActionClick.emit(result?.method);
      });
  }
}
