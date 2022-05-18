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

type Column = { label: string; key: string };

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit {
  @Input() columns: Column[];
  @Input() data: any[];
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
      this.columns.unshift({ label: 'Icon', key: 'icon' });
      this.data = this.data.map((row) => ({ icon: this.icon, ...row }));
    }

    console.log(this.data);

    this.displayedColumns = this.columns.map((row) => row.label);
  }

  sortData(sort: Sort): void {
    this.onSortChange.emit(sort.active);
  }
}
