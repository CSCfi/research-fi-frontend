import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-filter-limit-button',
    imports: [CommonModule, MatButtonModule],
    templateUrl: './filter-limit-button.component.html',
    styleUrls: ['./filter-limit-button.component.scss']
})
export class FilterLimitButtonComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();

  @Input() step = 0;
  @Input() min = 0;
  @Input() max = 0;

  clamp(value: number) {
    return Math.min(Math.max(value, this.min), this.max);
  }
}
