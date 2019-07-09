//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  @Input() responseData: any [];
  resultType: string;
  searchTerm: any;

  constructor( private searchService: SearchService) {
    this.searchTerm = this.searchService.singleInput;
  }

  ngOnInit() {
  }

  getResultType(type: string) {
    switch (type) {
      case 'publication': {
        this.resultType = 'Publications';
        break;
      }
      case 'person': {
        this.resultType = 'Persons';
        break;
      }
      case 'funding': {
        this.resultType = 'Fundings';
        break;
      }
      default: {
        this.resultType = '';
      }
    }
  }

}
