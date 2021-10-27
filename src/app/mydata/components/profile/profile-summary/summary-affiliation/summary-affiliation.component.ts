//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-affiliation',
  templateUrl: './summary-affiliation.component.html',
  styleUrls: ['./summary-affiliation.component.scss'],
})
export class SummaryAffiliationComponent implements OnInit {
  @Input() data: any;
  @Input() fieldTypes: any;

  constructor() {}

  ngOnInit(): void {
    console.log('SummaryAffiliationComponent', this.data);
  }
}
