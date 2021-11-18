import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-stepper-navigation',
  templateUrl: './stepper-navigation.component.html',
  styleUrls: ['./stepper-navigation.component.scss'],
})
export class StepperNavigationComponent implements OnInit {
  @Input() nextContent: string;
  @Input() disableNext = false;
  @Output() changeStep = new EventEmitter<string>();

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  previous = $localize`:@@previous:Edellinen`;
  next = $localize`:@@next:Seuraava`;

  constructor() {}

  ngOnInit(): void {}

  increment() {
    !this.disableNext && this.changeStep.emit('increment');
  }

  decrement() {
    this.changeStep.emit('decrement');
  }
}
