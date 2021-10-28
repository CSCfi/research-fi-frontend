//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-affiliations',
  templateUrl: './summary-affiliation.component.html',
})
export class SummaryAffiliationsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldTypes: any;
  sortedItems: any[];

  locale = 'Fi';

  columns = [
    { label: 'Yksikkö', field: 'unit' },
    { label: 'Nimike', field: 'positionName' },
    { label: 'Tutkimusyhteisö', field: 'researchCommunity' },
    { label: 'Rooli tutkimusyhteisössä', field: 'roleInResearchCommunity' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.sortAffiliations(this.data);

    console.log(this.sortedItems[0]);
  }

  // Sort primary affiliations first
  sortAffiliations(data) {
    const groupItems = data.groupItems;

    groupItems.map(
      (groupItem) =>
        (groupItem.items = groupItem.items.map((item) => ({
          ...item,
          source: groupItem.source,
        })))
    );

    const items = [...groupItems].flatMap((groupItem) => groupItem.items);

    this.sortedItems = items.sort(
      (a, b) => b.itemMeta.primaryValue - a.itemMeta.primaryValue
    );
  }
}
