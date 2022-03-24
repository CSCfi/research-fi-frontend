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
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  DialogPosition,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Icon } from '@fortawesome/fontawesome-svg-core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DialogTemplateComponent } from './dialog-template/dialog-template.component';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})
export class DialogComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() template: any;
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
  @Input() headerInfoTemplate: TemplateRef<any>;
  @Input() extraHeaderTemplate: TemplateRef<any>;
  @Output() onDialogClose = new EventEmitter<any>();
  @Output() onActionClick = new EventEmitter<any>();

  dialogRef: MatDialogRef<DialogTemplateComponent>;

  dialogResultSub: Subscription;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.openDialog();
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
      autoFocus: false,
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
        extraHeaderTemplate: this.extraHeaderTemplate,
      },
      panelClass: ['responsive-dialog', this.extraClass],
      disableClose: this.disableClose ? true : false,
      position: this.position ? this.handlePosition() : null,
    });

    // Only display uppermost dialog
    const handleDialogVisibility = () => {
      const openDialogs = this.dialog.openDialogs;
      const parentDialog = openDialogs[openDialogs.length - 2];

      parentDialog
        ? parentDialog.addPanelClass('hidden')
        : openDialogs[openDialogs.length - 1]?.removePanelClass('hidden');
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
  }
}
