import { Component, OnInit, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-secondary-button',
  templateUrl: './secondary-button.component.html',
  styleUrls: ['./secondary-button.component.scss']
})
export class SecondaryButtonComponent implements OnInit {

  @Input() icon: IconDefinition;
  @Input() content: string;
  @Input() disabled: boolean;
  @Input() big: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
