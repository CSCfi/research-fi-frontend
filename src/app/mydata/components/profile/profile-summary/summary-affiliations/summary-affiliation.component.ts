//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { sortItemsBy } from '@mydata/utils';

@Component({
  selector: 'app-summary-affiliations',
  templateUrl: './summary-affiliation.component.html',
})
export class SummaryAffiliationsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldTypes: any;

  sortItemsBy = sortItemsBy;
  sortedItems: any[];

  locale = 'Fi';

  columns = [
    { label: $localize`:@@unit:Yksikkö`, field: 'departmentName' },
    { label: $localize`:@@title:Nimike`, field: 'positionName' },
    {
      label: $localize`:@@researchCommunity:Tutkimusyhteisö`,
      field: 'researchCommunity',
    },
    {
      label: $localize`:@@roleInResearchCommunity:Rooli tutkimusyhteisössä`,
      field: 'roleInResearchCommunity',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.sortedItems = this.sortItemsBy(this.data, 'itemMeta.primaryValue');
  }
}
