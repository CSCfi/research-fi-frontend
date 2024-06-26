//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  LegacyDialogPosition as DialogPosition,
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { Icon } from '@fortawesome/fontawesome-svg-core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DialogTemplateComponent } from './dialog-template/dialog-template.component';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})
export class DialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() title: string;
  @Input() template: TemplateRef<any>;
  @Input() footerTemplate: any;
  @Input() actions: any[];
  @Input() extraContentTemplate: any;
  @Input() small: boolean;
  @Input() disableClose: boolean;
  @Input() icon: Icon;
  @Input() centerTitle: any;
  @Input() noPadding: any;
  @Input() wide: any;
  @Input() position: string;
  @Input() extraClass: string;
  @Input() hideClose: boolean;
  @Input() headerInfoTemplate: TemplateRef<any>;
  @Input() selectedItemsCount: number;
  @Output() onDialogClose = new EventEmitter<any>();
  @Output() onActionClick = new EventEmitter<any>();

  dialogRef: MatDialogRef<DialogTemplateComponent>;

  dialogResultSub: Subscription;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.openDialog();
  }

  ngOnChanges() {
    /*
     * Enables change detection on defined values
     */
    if (this.dialogRef) {
      this.dialogRef.componentInstance.updateActions(this.actions);
      this.dialogRef.componentInstance.data.selectedItemsCount =
        this.selectedItemsCount;
    }
  }

  openDialog() {
    // Separate actions into parent columns.
    let spreadActions = false;

    if (this.actions?.find((action) => action.flexStart)) {
      spreadActions = true;

      this.actions = [
        this.actions.filter((action) => action.flexStart),
        this.actions.filter((action) => !action.flexStart),
      ];
    }

    const checkInput = (property: any) =>
      typeof property === 'string' ? true : false;

    const wideDialog = checkInput(this.wide);

    const dialogSettings = {
      maxWidth: wideDialog ? 'calc(100% - 3rem)' : '44vh',
    };

    const smallDialogSettings = {
      minWidth: 'unset',
      width: 'unset',
      maxHeight: 'unset',
      height: 'unset',
    };

    this.dialogRef = this.dialog.open(DialogTemplateComponent, {
      ...(this.small ? smallDialogSettings : dialogSettings),
      autoFocus: true,
      data: {
        title: this.title,
        template: this.template,
        footerTemplate: this.footerTemplate,
        actions: this.actions || [],
        extraContentTemplate: this.extraContentTemplate,
        spreadActions: spreadActions,
        icon: this.icon,
        centerTitle: checkInput(this.centerTitle),
        noPadding: checkInput(this.noPadding),
        wide: checkInput(this.wide),
        headerInfoTemplate: this.headerInfoTemplate,
        hideClose: this.hideClose,
        selectedItemsCount: this.selectedItemsCount,
      },
      panelClass: ['responsive-dialog', this.extraClass],
      disableClose: this.disableClose ? true : false,
      position: this.position ? this.handlePosition() : null,
      ariaLabel: this.title + ' dialog',
    });

    // Only display uppermost dialog
    const handleDialogVisibility = () => {
      const openDialogs = this.dialog.openDialogs;
      const parentDialog = openDialogs[openDialogs.length - 2];

      const classes = ['hidden', 'cdk-visually-hidden'];

      parentDialog
        ? parentDialog.addPanelClass(classes)
        : openDialogs[openDialogs.length - 1]?.removePanelClass(classes);
    };

    handleDialogVisibility();

    this.dialogResultSub = this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        this.onActionClick.emit(result?.method);
        handleDialogVisibility();
      });
  }

  handlePosition() {
    let result: DialogPosition;

    switch (this.position) {
      case 'top': {
        result = { top: '2rem' };
      }
    }

    return result;
  }

  ngOnDestroy(): void {
    this.dialogResultSub?.unsubscribe();
    this.dialogRef.close();
  }
}
