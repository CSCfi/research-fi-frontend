// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-mydata-terms',
  templateUrl: './mydata-terms.component.html',
})

/*
 * This component renders content for Terms and Privacy pages.
 * Text content is handled in CMS.
 */
export class MyDataTerms implements OnInit {
  @Input() id: string;

  currentLocale: string;
  content: string;

  constructor(
    private route: ActivatedRoute,
    private appSettingsService: AppSettingsService,
    private utilityService: UtilityService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit() {
    // Get text content from CMS
    const pageData = this.route.snapshot.data.pages;

    const getPageData = (id: string): void => {
      const data = pageData.find((page) => page.id === id);

      this.utilityService.setMyDataTitle(data['title' + this.currentLocale]);
      this.content = data['content' + this.currentLocale];
    };

    switch (this.id) {
      case 'terms': {
        getPageData('mydata_terms_of_use');
        break;
      }
      case 'privacy': {
        getPageData('mydata_privacy_policy');
        break;
      }
    }
  }
}
