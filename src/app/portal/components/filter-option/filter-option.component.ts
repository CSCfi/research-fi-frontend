import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-filter-option',
  templateUrl: './filter-option.component.html',
  styleUrls: ['./filter-option.component.scss'],
  imports: [
    FormsModule,
    MatRippleModule
  ],
  standalone: true
})
export class FilterOptionComponent {
  @Input() label = "";
  @Input() count = 0;

  @Input() value: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  toggleValue() {
    this.value = !this.value;
    this.valueChange.emit(this.value);
  }
}
