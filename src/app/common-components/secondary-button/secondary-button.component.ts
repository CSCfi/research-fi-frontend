import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-secondary-button',
  templateUrl: './secondary-button.component.html',
  styleUrls: ['./secondary-button.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SecondaryButtonComponent implements OnInit {

  @Input() icon: IconDefinition;
  @Input() iconAfter: boolean;
  @Input() noSmIcon: boolean;
  @Input() content: string;
  @Input() disabled: boolean;
  @Input() big: boolean;
  @Input() small: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
