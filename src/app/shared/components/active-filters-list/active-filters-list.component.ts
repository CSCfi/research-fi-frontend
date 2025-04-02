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
  Output,
  ViewEncapsulation,
  EventEmitter,
} from '@angular/core';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ActiveFilter, ActiveFiltersDialogConfig } from 'src/types';
import { DialogComponent } from '../dialog/dialog.component';
import { ActiveFiltersDialogComponent } from './active-filters-dialog/active-filters-dialog.component';
import { MatButton } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgFor, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-active-filters-list',
    templateUrl: './active-filters-list.component.html',
    styleUrls: ['./active-filters-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
  imports: [
    NgFor,
    NgIf,
    FontAwesomeModule,
    MatButton,
    ActiveFiltersDialogComponent,
    DialogComponent,
    MatIcon,
    SvgSpritesComponent
  ]
})
export class ActiveFiltersListComponent implements OnInit {

  @Input() filters: ActiveFilter[] = [];
  @Input() dialogConfig: ActiveFiltersDialogConfig;

  dialogData: {
    active: ActiveFilter[];
  } & ActiveFiltersDialogConfig;

  @Output() onRemoveFilter = new EventEmitter();
  @Output() onClearFilters = new EventEmitter();

  showDialog: boolean;
  dialogTitle: string;

  constructor() {}

  ngOnInit(): void {}

  removeFilter(filter) {
    this.onRemoveFilter.emit(filter);
  }

  clearFilters() {
    this.onClearFilters.emit();
  }

  openDialog() {
    this.dialogData = {
      active: this.filters,
      filtersConfig: this.dialogConfig.filtersConfig,
      fromYear: this.dialogConfig.fromYear,
      toYear: this.dialogConfig.toYear,
    };
    this.showDialog = true;
    this.dialogTitle =
      $localize`:@@activeFilters:Rajaukset` + ` (${this.filters.length})`;
  }

  closeDialog() {
    this.showDialog = false;
  }
}
