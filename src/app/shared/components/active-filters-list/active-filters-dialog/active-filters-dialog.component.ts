//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { SortService } from 'src/app/portal/services/sort.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButton } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-active-filters-dialog',
    templateUrl: './active-filters-dialog.component.html',
    styleUrls: ['./active-filters-dialog.component.scss'],
    standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatButton,
    FontAwesomeModule,
    MatIcon,
    SvgSpritesComponent
  ]
})
export class ActiveFiltersDialogComponent implements OnInit {
  @Input() data: any;
  @Output() clearAllFilters = new EventEmitter<any>();
  activeFilters: any;
  fromYear: any;
  toYear: any;
  tabFilters: any;
  params: any;
  removeFlag: boolean;
  grouped: any;
  filterTranslation: any;
  objectKeys = Object.keys;

  showDialog: boolean;
  dialogTitle: string;

  constructor(
    private router: Router,
    private sortService: SortService,
    private dialogRef: MatDialog
  ) {}

  ngOnInit(): void {
    this.dialogTitle =
      $localize`:@@activeFilters:Rajaukset` + ` (${this.data.active.length})`;

    this.activeFilters = this.data.active;
    this.fromYear = this.data.fromYear;
    this.toYear = this.data.toYear;
    this.tabFilters = this.data.filtersConfig;

    // Group the filters by category
    this.grouped = this.groupBy(this.activeFilters, 'category');

    // Get the translations for the filter field values
    this.filterTranslation = this.groupBy(this.tabFilters, 'field');

    Object.keys(this.filterTranslation).forEach(
      (x) => (this.filterTranslation[x] = this.filterTranslation[x][0].label)
    );
  }

  groupBy(arr, key, value?) {
    return arr.reduce((storage, item) => {
      // get the first instance of the category
      const group = item[key];

      // set storage or initialize it
      storage[group] = storage[group] || [];

      // add the current item to storage
      storage[group].push(item[value] || item);

      // return the updated storage to the next iteration
      return storage;
    }, {}); // initially empty object {} as storage
  }

  removeFilter(filter) {
    // Remove range filters. Check that target active filter matches fromYear filter
    if (filter.length === 5 && filter.slice(0, 1) === 'f') {
      if (this.fromYear && this.toYear) {
        this.activeFilters = this.activeFilters.filter(
          (elem) => elem.category !== 'fromYear'
        );
        this.activeFilters = this.activeFilters.filter(
          (elem) => elem.category !== 'toYear'
        );
        this.activeFilters = this.activeFilters.filter(
          (elem) =>
            !(
              this.fromYear <= parseInt(elem.value, 10) &&
              parseInt(elem.value, 10) <= this.toYear
            )
        );
      } else if (this.fromYear) {
        this.activeFilters = this.activeFilters.filter(
          (elem) => elem.category !== 'fromYear'
        );
        this.activeFilters = this.activeFilters.filter(
          (elem) => !(this.fromYear <= parseInt(elem.value, 10))
        );
      } else if (this.toYear) {
        this.activeFilters = this.activeFilters.filter(
          (elem) => elem.category !== 'toYear'
        );
        this.activeFilters = this.activeFilters.filter(
          (elem) => !(this.toYear >= parseInt(elem.value, 10))
        );
      }
    }

    this.activeFilters = this.activeFilters.filter(
      (elem) => elem.value !== filter
    );
    this.data.active = this.activeFilters.filter(
      (elem) => elem.value !== filter
    );

    this.params = this.groupBy(this.activeFilters, 'category', 'value');
    this.grouped = this.groupBy(this.activeFilters, 'category');

    this.params.sort = this.sortService.sortMethod;
    this.router.navigate([], { queryParams: this.params });
    this.removeFlag = true;
  }

  clearFilters() {
    this.clearAllFilters.emit(null);
    this.activeFilters = [];
    this.router.navigate([]);
    this.dialogRef.closeAll();
  }

  // Unsused for now, works if we want to filter with button click
  execute() {
    if (this.removeFlag) {
      this.router.navigate([], { queryParams: this.params });
    }
  }

  ngOnDestroy() {}
}
