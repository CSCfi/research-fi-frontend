//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { Subscription } from 'rxjs';
import { DialogAction } from 'src/types';
import { SecondaryButtonComponent } from '../../buttons/secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from '../../buttons/primary-action-button/primary-action-button.component';
import { CloseButtonComponent } from '../../buttons/close-button/close-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf, NgStyle, NgTemplateOutlet, NgClass, NgFor } from '@angular/common';

@Component({
    selector: 'app-dialog-template',
    templateUrl: './dialog-template.component.html',
    styleUrls: ['./dialog-template.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        NgStyle,
        FontAwesomeModule,
        NgTemplateOutlet,
        CloseButtonComponent,
        MatDialogContent,
        NgClass,
        MatDialogActions,
        NgFor,
        PrimaryActionButtonComponent,
        SecondaryButtonComponent,
    ],
})
export class DialogTemplateComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  mobile: boolean;
  displayExtraContent = false;
  dialogActions: any[];
  @ViewChild('closeButton') closeButton: ElementRef;
  closeButtonWidth: number = 0;
  @Output() onActiveActionClick = new EventEmitter<any>();
  mobileStatusSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      template: object;
      footerTemplate: string;
      actions: DialogAction[];
      spreadActions: boolean;
      extraContentTemplate: object;
      centerTitle: boolean;
      noPadding: boolean;
      wide: boolean;
      headerInfoTemplate: object;
      selectedItemsCount: number;
    },
    private dialogRef: MatDialogRef<DialogTemplateComponent>,
    private appSettingsService: AppSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Unbind from original actions
    this.dialogActions = cloneDeep(this.data.actions);

    this.mobileStatusSub = this.appSettingsService.mobileStatus
      .pipe(take(1))
      .subscribe((status) => (this.mobile = status));
  }

  doAction(action: DialogAction) {
    // Use case when button text content changes on button click, e.g. MyData patch preview
    if (action.labelToggle) {
      action.label = !this.displayExtraContent
        ? action.labelToggle.off
        : action.labelToggle.on;
    }

    switch (action.method) {
      // Use case for MyData patch preview button
      case 'preview': {
        this.displayExtraContent = !this.displayExtraContent;
        break;
      }
      case 'add': {
        action.action();
        return;
      }
      default: {
        this.dialogRef.close({
          method: action.method,
        });
      }
    }
  }

  updateActions(actions) {
    this.dialogActions = cloneDeep(actions);
  }

  ngAfterViewInit() {
    // Get close button width for helper div when using centered title
    if (this.closeButton) {
      this.closeButtonWidth = this.closeButton.nativeElement.offsetWidth;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.mobileStatusSub?.unsubscribe();
  }

  close() {
    this.dialogRef.close();
  }
}
