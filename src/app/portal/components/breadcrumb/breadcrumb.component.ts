//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, Inject, LOCALE_ID } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SearchService } from '../../services/search.service';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    imports: [
        NgIf,
        RouterLink,
        NgFor,
    ]
})
export class BreadcrumbComponent implements OnInit {
  @Input() responseData: any;
  @Input() tab: any;
  @Input() tabName: any;
  @Input() resultNameField: any;
  @Input() type: any;
  @Input() queryParams: any;
  @Input() title: string;
  resultType: string;
  searchTerm: any;
  pageNumber: number;
  currentLocale: string;

  constructor(
    private searchService: SearchService,
    @Inject(LOCALE_ID) protected localeId: string,
    private appSettingsService: AppSettingsService
  ) {
    this.searchTerm = this.searchService.searchTerm;
    this.pageNumber = this.searchService.pageNumber || 1;

    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit() {}
}
