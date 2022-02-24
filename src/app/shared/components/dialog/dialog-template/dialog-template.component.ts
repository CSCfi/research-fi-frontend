//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-dialog-template',
  templateUrl: './dialog-template.component.html',
  styleUrls: ['./dialog-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogTemplateComponent implements OnInit, AfterViewInit {
  mobile: boolean;
  displayExtraContent = false;
  dialogActions: any[];
  @ViewChild('closeButton') closeButton: ElementRef;
  closeButtonWidth: number;
  @Output() onActiveActionClick = new EventEmitter<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      template: object;
      footerTemplate: string;
      actions: any[];
      spreadActions: boolean;
      extraContentTemplate: object;
      centerTitle: boolean;
      noPadding: boolean;
      wide: boolean;
      headerInfoTemplate: object;
      extraHeaderTemplate: object;
    },
    private dialogRef: MatDialogRef<DialogTemplateComponent>,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    // Unbind from original actions
    this.dialogActions = cloneDeep(this.data.actions);

    this.appSettingsService.mobileStatus
      .pipe(take(1))
      .subscribe((status) => (this.mobile = status));
  }

  doAction(action: { method: string; label: string }) {
    switch (action.method) {
      // Special use case for MyData patch preview button
      case 'preview': {
        action.label = !this.displayExtraContent
          ? $localize`:@@hideDataToPublish:Piilota julkaistavat tiedot`
          : $localize`:@@showDataToPublish:Näytä julkaistavat tiedot`;
        this.displayExtraContent = !this.displayExtraContent;
        break;
      }
      default: {
        this.dialogRef.close({
          method: action.method,
        });
      }
    }
  }

  ngAfterViewInit() {
    // Get close button width for helper div when using centered title
    if (this.closeButton) {
      this.closeButtonWidth = this.closeButton.nativeElement.offsetWidth;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
