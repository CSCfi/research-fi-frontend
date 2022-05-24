import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Icon } from '@fortawesome/fontawesome-svg-core';
import { TableColumn } from 'src/types';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit {
  @Input() columns: TableColumn[];
  @Input() rows: any[];
  @Input() alignCenter: boolean;
  @Input() icon: Icon;
  @Input() iconTitle: string;
  @Input() iconLinkField: string;
  @Input() sortColumn: string;
  @Input() sortDirection: string;
  @Output() onSortChange = new EventEmitter<string>();

  displayedColumns: string[];

  constructor() {}

  ngOnInit(): void {
    if (this.icon) {
      this.columns.unshift({ key: 'icon', label: 'Icon', mobile: false });
      this.rows = this.rows.map((row) => ({ icon: this.icon, ...row }));
    }

    this.displayedColumns = this.columns.map((row) => row.key);
  }

  sortData(sort: Sort): void {
    this.onSortChange.emit(sort.active);
  }
}
