import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  imports: [
    NgIf,
    MatIconModule,
    NgClass
  ],
  standalone: true,
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'hidden' })),
      transition('expanded <=> collapsed', animate('0.1s ease-out'))
    ])
  ]
})
export class CollapsibleComponent {
  @Input() label = '';
  @Input() decoration = "none";

  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  toggle() {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }
}
