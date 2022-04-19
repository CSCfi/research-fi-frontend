import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input() columns: { label: string; key: string }[];
  @Input() rows: any[];
  @Input() icon: any;

  displayedColumns: string[];
  dataSource: any;

  constructor() {}

  ngOnInit(): void {
    // if (this.icon) {
    //   this.columns.unshift({ label: 'Icon', key: 'icon' });
    // }

    // console.log(this.columns);
    // console.log(this.icon);

    this.displayedColumns = this.columns.map((row) => row.label);
  }
}
