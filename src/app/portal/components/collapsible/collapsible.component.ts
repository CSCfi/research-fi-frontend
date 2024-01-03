import {
  Component, ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList, TemplateRef,
  ViewChild
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  imports: [
    NgIf,
    MatIconModule,
    NgClass,
    TooltipModule
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

  @Input() hasTooltip = false;

  toggle() {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }
}
