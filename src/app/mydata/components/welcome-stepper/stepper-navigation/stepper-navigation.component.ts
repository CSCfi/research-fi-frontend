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
  @Input() step: number;
  @Output() changeStep = new EventEmitter<string>();

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  continue = $localize`:@@continue:Jatka`;
  cancelDeployment = $localize`:@@cancelDeployment:Peruuta käyttöönotto`;

  constructor() {}

  ngOnInit(): void {}

  navigate(action: 'increment' | 'decrement' | 'cancel') {
    this.changeStep.emit(action);
  }
}
