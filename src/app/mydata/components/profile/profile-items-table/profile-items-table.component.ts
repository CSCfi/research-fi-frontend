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
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Sort, SortDirection, MatSort, MatSortHeader } from '@angular/material/sort';
import {
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { PatchService } from '@mydata/services/patch.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { EditorModalColumn, ItemMeta } from 'src/types';
import { IsPortalItemPipe } from '../../../pipes/is-portal-item.pipe';
import { GetValuePipe } from '../../../pipes/get-value.pipe';
import { CutContentPipe } from '../../../../shared/pipes/cut-content.pipe';
import { MatPaginator } from '@angular/material/paginator';
import { DatasetAuthorComponent } from '../../../../portal/components/single/single-dataset/dataset-author/dataset-author.component';
import { SecondaryButtonComponent } from '../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgFor, NgIf } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-profile-items-table',
    templateUrl: './profile-items-table.component.html',
    styleUrls: ['./profile-items-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
  imports: [
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCheckbox,
    MatCellDef,
    MatCell,
    NgFor,
    MatSortHeader,
    NgIf,
    FontAwesomeModule,
    SecondaryButtonComponent,
    DatasetAuthorComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    CutContentPipe,
    GetValuePipe,
    IsPortalItemPipe,
    SvgSpritesComponent
  ]
})
export class ProfileItemsTableComponent implements OnInit, OnChanges {
  @Input() columns: EditorModalColumn[];
  @Input() data: any;
  @Input() tableConfig: { defaultSort: string };

  @Output() onSingleItemToggle = new EventEmitter<any>();
  @Output() onAllItemToggle = new EventEmitter<any>();

  sortSettings: any;

  currentPage = 0;
  currentPageSize = 10;
  pageCount: number;

  showMoreArray = [];

  faSort = faSort as any; // TODO: Fix type
  faSortDown = faSortDown as any; // TODO: Fix type
  faSortUp = faSortUp as any; // TODO: Fix type

  displayedColumns: string[];

  sortColumn = '';
  activeSort: string;
  sortDirection: SortDirection;

  tableRows: any[] = [];
  originalRows: any[];
  allSelected: boolean;

  constructor(
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private fundingsService: FundingsService
  ) {}

  ngOnInit(): void {
    // Configuration for mat-table.
    // Selection and show-more columns are automatically appended
    this.displayedColumns = this.columns.map((column) => column.id);
    this.displayedColumns.unshift('selection');
    this.displayedColumns.push('show-more');

    // Original data is used in sort reset
    this.originalRows = this.tableRows;
  }

  ngOnChanges() {
    if (this.data) {
      this.tableRows = this.data.fields[0].items;
      this.checkAllSelected();
      this.pageCount = Math.ceil(this.tableRows.length / this.currentPageSize);
    }
  }

  sort(sort: Sort) {
    // Create a shallow copy of current rows so original data doesn't change
    const data = this.tableRows.slice();

    if (!sort.active || sort.direction === '') {
      this.activeSort = '';
      this.tableRows = this.originalRows;
      return;
    }

    // Simple compare method for returning numeric value for JS sort() function
    const compare = (
      a: string | number,
      b: string | number,
      isAsc: boolean
    ) => {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    };

    // Inference correct sort column and sort with compare -method
    const sortables: string[] = this.columns.map((column) => column.id);

    // Get sortable field
    const sortField = this.columns.find(
      (column) => column.id === sort.active
    ).field;

    this.tableRows = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const matchIndex = sortables.indexOf(sort.active);

      if (matchIndex > -1) {
        return compare(a[sortField], b[sortField], isAsc);
      } else {
        return 0;
      }
    });

    this.activeSort = sort.active;
    this.sortDirection = sort.direction;
  }

  paginate(event) {
    this.currentPage = event.pageIndex;
    this.currentPageSize = event.pageSize;

    this.pageCount = Math.ceil(this.tableRows.length / event.pageSize);
  }

  toggleShowMore(index) {
    const arr = this.showMoreArray;
    const item = arr.indexOf(index);

    if (item > -1) {
      arr.splice(item, 1);
    } else {
      this.showMoreArray.push(index);
    }
  }

  toggleItem(
    event: { checked: boolean },
    item: { itemMeta: ItemMeta; dataSources: any[] }
  ) {
    item.itemMeta.show = event.checked;

    this.onSingleItemToggle.emit();

    if (
      item.dataSources?.find(
        (dataSource) => dataSource.registeredDataSource === 'ttv'
      )
    ) {
      // Handle portal item patch
      switch (item.itemMeta.type) {
        case FieldTypes.activityPublication: {
          this.publicationsService.addToPayload(item);
          break;
        }
        case FieldTypes.activityDataset: {
          this.datasetsService.addToPayload(item);
          break;
        }
        case FieldTypes.activityFunding: {
          this.fundingsService.addToPayload(item);
          break;
        }
      }
    } else {
      // Regular patch
      this.patchService.addToPayload({
        ...item.itemMeta,
        show: event.checked,
      });
    }

    this.checkAllSelected();
  }

  toggleAll(event: { checked: boolean }) {
    for (const row of this.tableRows) {
      row.itemMeta.show = event.checked;

      this.patchService.addToPayload({
        ...row.itemMeta,
        show: event.checked
      });
    }

    this.tableRows = [...this.tableRows];

    this.checkAllSelected();
    this.onAllItemToggle.emit();
  }

  checkAllSelected() {
    const pageItems = this.tableRows.slice(
      this.currentPage,
      this.currentPageSize * (this.currentPage + 1)
    );

    this.allSelected =
      pageItems.filter((row) => row.itemMeta.show).length === pageItems.length;
  }

  // Removes item added from portal search but which hasn't been patched yet
  removeItem(item: { itemMeta: ItemMeta }) {
    this.tableRows = this.tableRows.filter(
      (el) => el.itemMeta.id !== item.itemMeta.id
    );

    this.data.fields[0].items = this.tableRows; // Updates data in summary

    this.onSingleItemToggle.emit();

    switch (item.itemMeta.type) {
      case FieldTypes.activityPublication: {
        this.publicationsService.addToDeletables(item);
        break;
      }
      case FieldTypes.activityDataset: {
        this.datasetsService.addToDeletables(item);
        break;
      }
      case FieldTypes.activityFunding: {
        this.fundingsService.addToDeletables(item);
        break;
      }
    }
  }
}
