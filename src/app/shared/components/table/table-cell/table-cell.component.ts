import { Component, Input, OnInit } from '@angular/core';
import { CutContentPipe } from '@shared/pipes/cut-content.pipe';

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
})
export class TableCellComponent implements OnInit {
  @Input() data: any;

  constructor(private cutContentPipe: CutContentPipe) {}

  ngOnInit(): void {
    // Cut long labels to max 100 characters with CutContentPipe
    if (!this.data.link) {
      this.data.label = this.cutContentPipe.transform(this.data.label, 100);
    }
  }
}
