//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-template',
  templateUrl: './dialog-template.component.html',
  styleUrls: ['./dialog-template.component.scss'],
})
export class DialogTemplateComponent implements OnInit {
  mobile: boolean;
  displayExtraContent = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogTemplateComponent>,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.appSettingsService.mobileStatus
      .pipe(take(1))
      .subscribe((status) => (this.mobile = status));
  }

  doAction(method: string) {
    switch (method) {
      case 'preview': {
        this.displayExtraContent = !this.displayExtraContent;
        break;
      }
      default: {
        this.dialogRef.close({
          method: method,
        });
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
