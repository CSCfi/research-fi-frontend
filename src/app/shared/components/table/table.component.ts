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
  OnInit,
  Output,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Icon } from '@fortawesome/fontawesome-svg-core';
import {
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { TableColumn, TableRow } from 'src/types';

// type Selection = { checked: boolean; index: number };

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit {
  @Input() columns: TableColumn[];
  @Input() rows: TableRow[];
  @Input() activeRowIdentifierField: string; // Row highlight
  @Input() borders: boolean; // Add borders to rows
  @Input() alignCenter: boolean;
  @Input() icon: Icon;
  @Input() iconTitle: string;
  @Input() iconLinkField: string; // Icon can act as a link. Icon link field object needs a 'link' prop
  @Input() sortColumn: string;
  @Input() sortDirection: string;
  @Input() sortQueryParams: boolean;
  @Input() mobileCards: boolean; // Development purposes

  @Output() onSortChange = new EventEmitter<Sort>();
  @Output() onSelectionChange = new EventEmitter<number[]>();
  @Output() onToggleSelectAll = new EventEmitter();

  displayedColumns: string[];

  allSelected = false;
  selectedRows: number[] = [];

  selectable: boolean;

  faSort = faSort;
  faSortDown = faSortDown;
  faSortUp = faSortUp;

  @ViewChildren('rowSelect') rowSelectList: QueryList<MatCheckbox>;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // selectable is used when displaying select all -checkbox in cards view
    this.selectable = !!this.columns.find(
      (column) => column.key === 'selection'
    );

    if (this.icon) {
      this.columns.unshift({
        key: 'icon',
        label: 'Icon',
        mobile: false,
        labelHidden: true,
      });
      this.rows = this.rows.map((row) => ({ icon: this.icon, ...row }));
    }

    this.displayedColumns = this.columns.map((row) => row.key);
  }

  sortData(sort: Sort): void {
    this.onSortChange.emit(sort);

    // Initial approach to unify sorting logic by passing query params in one place
    // Used in MyData data sources
    if (this.sortQueryParams) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams:
          sort.direction === '' // Reset sort after descending sort direction
            ? { sort: null, sortDirection: null }
            : { sort: sort.active, sortDirection: sort.direction },
        queryParamsHandling: 'merge',
      });
    }
  }

  handleSelection(event: MatCheckboxChange, index: number) {
    this.allSelected = !!!this.rowSelectList
      .toArray()
      .find((item) => !item.checked);

    // Create new array so table cards detect changes
    const newSelection = [...this.selectedRows];
    newSelection.push(index);

    this.selectedRows.indexOf(index) > -1
      ? (this.selectedRows = this.selectedRows.filter((i) => i !== index))
      : event.checked && (this.selectedRows = newSelection);

    this.onSelectionChange.emit(this.selectedRows);
  }

  handleSelectAll(event: MatCheckboxChange) {
    this.allSelected = event.checked;

    const rowsArr = this.rowSelectList.toArray();

    this.selectedRows = event.checked
      ? rowsArr.map((_row, index) => index)
      : [];

    rowsArr.forEach((item) => (item.checked = event.checked));

    this.onSelectionChange.emit(this.selectedRows);
  }
}
