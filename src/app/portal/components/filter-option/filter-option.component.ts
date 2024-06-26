import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

@Component({
  selector: 'app-filter-option',
  templateUrl: './filter-option.component.html',
  styleUrls: ['./filter-option.component.scss'],
  imports: [
    FormsModule,
    MatRippleModule,
    MatCheckboxModule
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
