//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { SearchService } from '@portal/services/search.service';

@Component({
  selector: 'app-results-pagination',
  templateUrl: './results-pagination.component.html',
})
export class ResultsPaginationComponent implements OnInit {
  @Input() data: any;

  constructor(public searchService: SearchService) {}

  ngOnInit(): void {}
}
