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
import { Sort, MatSort, MatSortHeader } from '@angular/material/sort';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TableColumn, TableRow } from 'src/types';
import { CutContentPipe } from '../../pipes/cut-content.pipe';
import { TableCardComponent } from './table-card/table-card.component';
import { TableCellComponent } from './table-cell/table-cell.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule } from '@angular/forms';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import {
  NgIf,
  NgFor,
  NgClass,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet,
  JsonPipe
} from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

// type Selection = { checked: boolean; index: number };

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
  imports: [
    NgIf,
    MatTable,
    MatSort,
    NgFor,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    MatCheckbox,
    FormsModule,
    NgSwitchDefault,
    TooltipModule,
    MatCellDef,
    MatCell,
    RouterLink,
    NgTemplateOutlet,
    TableCellComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    TableCardComponent,
    CutContentPipe,
    MatIcon,
    SvgSpritesComponent,
    JsonPipe
  ]
})
export class TableComponent implements OnInit {
  @Input() columns: TableColumn[];
  @Input() rows: TableRow[];
  @Input() activeRowIdentifierField: string; // Row highlight
  @Input() borders: boolean; // Add borders to rows
  @Input() alignCenter: boolean;
  @Input() svgSymbolName: string;
  @Input() iconTitle: string;
  @Input() iconLinkField: string; // Icon can act as a link. Icon link field object needs a 'link' prop
  @Input() sortColumn: string;
  @Input() sortDirection: string;
  @Input() sortQueryParams: boolean;
  @Input() mobileCards: boolean; // Development purposes
  @Input() allSelected: boolean;
  @Input() currentSelection: any[];
  @Input() pageNumber: number;
  @Input() pageSize: number;

  @Output() onSortChange = new EventEmitter<Sort>();
  @Output() onSelectionChange = new EventEmitter<number | string>();
  @Output() onToggleSelectAll = new EventEmitter();

  displayedColumns: string[];

  // allSelected = false;
  selectedRows: number[] = [];

  selectable: boolean;

  @ViewChildren('rowSelect') rowSelectList: QueryList<MatCheckbox>;

  constructor(private route: ActivatedRoute, private router: Router) {}


  ngOnInit(): void {
    // selectable is used when displaying select all -checkbox in cards view
    this.selectable = !!this.columns.find(
      (column) => column.key === 'selection'
    );

    if (this.svgSymbolName) {
      this.columns.unshift({
        key: 'icon',
        label: 'Icon',
        mobile: false,
        labelHidden: true,
      });
      this.rows = this.rows.map((row) => ({ icon: this.svgSymbolName, ...row }));
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

  handleSelection(_event: MatCheckboxChange, index: number, elementId?: string) {
    if (elementId?.length > 0) {
      this.onSelectionChange.emit(elementId);
    } else {
      this.onSelectionChange.emit(index);
    }
  }

  // User is able to select all entries
  handleSelectAll(event: MatCheckboxChange) {
    const rowsArr = this.rowSelectList.toArray();

    this.selectedRows = event.checked
      ? rowsArr.map((_row, index) => index)
      : [];

    this.onToggleSelectAll.emit(event);
  }
}
