//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, Inject, LOCALE_ID } from '@angular/core';
import { SearchService } from '@portal.services/search.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
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

  constructor( private searchService: SearchService,  @Inject( LOCALE_ID ) protected localeId: string) {
    this.searchTerm = this.searchService.searchTerm;
    this.pageNumber = this.searchService.pageNumber || 1;
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  ngOnInit() {
  }
}
