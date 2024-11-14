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
} from '@angular/core';
import { TableColumn, TableRow } from 'src/types';
import { TableCellComponent } from '../table-cell/table-cell.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgFor, NgClass, NgSwitch, NgIf, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
    selector: 'app-table-card',
    templateUrl: './table-card.component.html',
    styleUrls: ['./table-card.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        NgClass,
        NgSwitch,
        NgIf,
        FontAwesomeModule,
        TooltipModule,
        NgSwitchCase,
        MatCheckbox,
        NgSwitchDefault,
        TableCellComponent,
    ],
})
export class TableCardComponent implements OnInit, OnChanges {
  @Input() index: number;
  @Input() columns: TableColumn[];
  @Input() row: TableRow[];
  @Input() active: boolean;
  @Input() selectedRows: number[];

  @Output() onSelectionChange = new EventEmitter();

  selected: boolean;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.selected = this.selectedRows.indexOf(this.index) > -1;
  }

  handleSelection(event) {
    this.onSelectionChange.emit(event);
  }
}
