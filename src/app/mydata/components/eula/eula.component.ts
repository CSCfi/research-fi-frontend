// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-eula',
  templateUrl: './eula.component.html',
})

/*
 *  EULA html templates are used in multiple places.
 *  Parent component sends template name and this component renders corresponding template which is passed to dialog component.
 */
export class EulaComponent implements OnChanges {
  @Input() template: string;

  @ViewChild('termsTemplate', { static: true }) termsTemplate: ElementRef;
  @ViewChild('personalDataHandlingTermsTemplate', { static: true })
  personalDataHandlingTermsTemplate: ElementRef;

  currentTemplate: any;

  constructor() {}

  ngOnChanges() {
    switch (this.template) {
      case 'termsTemplate': {
        this.currentTemplate = this.termsTemplate;
        break;
      }
      case 'personalDataHandlingTermsTemplate': {
        this.currentTemplate = this.personalDataHandlingTermsTemplate;
        break;
      }
    }
  }
}
