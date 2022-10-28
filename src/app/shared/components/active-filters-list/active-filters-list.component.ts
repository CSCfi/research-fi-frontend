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

@Component({
  selector: 'app-active-filters-list',
  templateUrl: './active-filters-list.component.html',
  styleUrls: ['./active-filters-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActiveFiltersListComponent implements OnInit {
  faTrashAlt = faTrashAlt;

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
