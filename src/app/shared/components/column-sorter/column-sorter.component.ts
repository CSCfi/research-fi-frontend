import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-column-sorter',
  templateUrl: './column-sorter.component.html',
  styleUrls: ['./column-sorter.component.scss'],
  imports: [
    NgSwitch, NgSwitchCase, NgIf
  ],
  standalone: true
})
export class ColumnSorterComponent {
  @Input() name: string;
  @Input() value: string;

  /*@Input() direction: number;
  @Output() directionChange = new EventEmitter<number>();

  toggleSort() {
    if (this.direction === 0) {
      this.directionChange.emit(1);
    } else if (this.direction === 1) {
      this.directionChange.emit(-1);
    } else {
      this.directionChange.emit(0);
    }
  }*/
}
