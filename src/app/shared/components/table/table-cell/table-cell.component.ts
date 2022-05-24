import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
})
export class TableCellComponent implements OnInit {
  @Input() data: any;

  constructor() {}

  ngOnInit(): void {
    const maxLabelLength = 100;

    const label = this.data.label;

    // Cut long labels to max 100 characters
    if (!this.data.link && label?.length > maxLabelLength) {
      this.data.label = label.slice(0, maxLabelLength) + '...';
    }
  }
}
