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
  @Input() template: any;
  @Input() actions: any;
  @Input() title: string;
  @Output() onDialogClose = new EventEmitter<any>();

  dialogRef: MatDialogRef<DialogTemplateComponent>;

  constructor(
    public dialog: MatDialog,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.openDialog();
  }

  openDialog() {
    let mobile: boolean;

    this.appSettingsService.mobileStatus.pipe(take(1)).subscribe((status) => {
      mobile = status;
    });

    this.dialogRef = this.dialog.open(DialogTemplateComponent, {
      minWidth: '44vw',
      maxWidth: mobile ? '100vw' : '44vw',
      data: {
        title: this.title,
        template: this.template,
        actions: this.actions,
      },
    });

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        this.onDialogClose.emit(true);
      });
  }
}
