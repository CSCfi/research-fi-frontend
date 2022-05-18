import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
})
export class TableCellComponent implements OnInit {
  @Input() data: any;

  constructor() {}

  ngOnInit(): void {}
}
