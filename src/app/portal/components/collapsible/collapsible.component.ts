import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  imports: [
    NgIf,
    MatIconModule,
    NgClass
  ],
  standalone: true
})
export class CollapsibleComponent {
  @Input() label = '';

  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  toggle() {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }
}
