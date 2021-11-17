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
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-eula',
  templateUrl: './eula.component.html',
})

/*
 *  EULA html templates are used in multiple places.
 *  Parent component sends template name and this component renders corresponding template which is passed to dialog component.
 */
export class EulaComponent implements OnInit, OnChanges {
  @Input() template: string;

  @ViewChild('termsTemplate', { static: true }) termsTemplate: ElementRef;
  @ViewChild('personalDataHandlingTermsTemplate', { static: true })
  personalDataHandlingTermsTemplate: ElementRef;

  currentTemplate: any;
  currentLocale: string = 'Fi';

  useOfTermsContent: any;
  personalDataHandlingTermsContent: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get text content from CMS
    const pageData = this.route.snapshot.data.pages;

    this.useOfTermsContent = pageData.find(
      (el) => el.id === 'mydata_terms_of_use'
    );

    this.personalDataHandlingTermsContent = pageData.find(
      (el) => el.id === 'mydata_privacy_policy'
    );
  }

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
