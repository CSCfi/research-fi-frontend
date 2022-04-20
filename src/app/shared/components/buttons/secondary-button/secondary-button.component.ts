import { Component, OnInit, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-secondary-button',
  templateUrl: './secondary-button.component.html',
  styleUrls: ['../buttons-shared.scss'],
})
export class SecondaryButtonComponent implements OnInit {
  @Input() icon: IconDefinition;
  @Input() iconAfter: boolean;
  @Input() iconOnly: boolean;
  @Input() noSmIcon: boolean;
  @Input() content: string;
  @Input() disabled: boolean;
  @Input() big: boolean;
  @Input() small: boolean;
  @Input() px0: boolean;

  constructor() {}

  ngOnInit(): void {}
}
