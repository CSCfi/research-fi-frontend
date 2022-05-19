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
  @Input() data: any[];
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
      this.data = this.data.map((row) => ({ icon: this.icon, ...row }));
    }

    console.log(this.columns);

    console.log(this.data);

    this.displayedColumns = this.columns.map((row) => row.key);
  }

  sortData(sort: Sort): void {
    this.onSortChange.emit(sort.active);
  }
}
