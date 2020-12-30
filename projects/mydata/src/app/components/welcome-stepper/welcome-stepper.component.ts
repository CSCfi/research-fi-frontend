//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewEncapsulation } from '@angular/core';
import { faAngleDoubleRight, faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-welcome-stepper',
  templateUrl: './welcome-stepper.component.html',
  styleUrls: ['./welcome-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeStepperComponent {
  step = 1;
  cancel = false;
  termsApproved = false;
  orcidSetting: string;
  fetching = false;

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;


  increment() {
    this.step = this.step + 1;
  }

  decrement() {
    this.step = this.step - 1;
  }

  toggleCancel() {
    this.cancel = !this.cancel;
  }

  onCancelClick(event) {
    this.toggleCancel();
  }

}
