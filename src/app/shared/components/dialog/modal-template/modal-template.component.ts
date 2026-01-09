import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { DialogAction } from '../../../../../types';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { cloneDeep } from 'lodash-es';
import { take } from 'rxjs/operators';
import { CloseButtonComponent } from '@shared/components/buttons/close-button/close-button.component';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  PrimaryActionButtonComponent
} from '@shared/components/buttons/primary-action-button/primary-action-button.component';
import { SecondaryButtonComponent } from '@shared/components/buttons/secondary-button/secondary-button.component';
import { TertiaryButtonComponent} from '@shared/components/buttons/tertiary-button/tertiary-button.component';

@Component({
  selector: 'app-modal-template',
  imports: [
    CloseButtonComponent,
    MatDialogActions,
    MatDialogContent,
    NgForOf,
    NgIf,
    PrimaryActionButtonComponent,
    SecondaryButtonComponent,
    NgTemplateOutlet,
    NgClass,
    TertiaryButtonComponent
  ],
  templateUrl: './modal-template.component.html',
  styleUrl: './modal-template.component.scss'
})
export class ModalTemplateComponent implements OnInit, AfterViewInit, OnDestroy
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
      hideClose?: boolean;
      noHeadingBorder?: boolean;
      underTitle?: string;
      useNewTemplate?: boolean;
      firstActionOnLeft?: boolean;
    },
    private dialogRef: MatDialogRef<ModalTemplateComponent>,
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