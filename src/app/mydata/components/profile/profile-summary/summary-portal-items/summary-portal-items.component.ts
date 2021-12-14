//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { sortItemsBy } from '@mydata/utils';

@Component({
  selector: 'app-summary-portal-items',
  templateUrl: './summary-portal-items.component.html',
})
export class SummaryPortalItemsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldType: any;
  @Input() sortField: string;
  @Input() showMoreLabel: string;

  sortItemsBy = sortItemsBy;
  sortedItems: any[];

  itemDisplayCount = 3;

  showMorePrefix = $localize`:@@showAll:Näytä kaikki`;

  constructor() {}

  ngOnInit(): void {
    // Sort and filter publications that shoudd be displayed
    this.sortedItems = this.sortItemsBy(this.data, this.sortField).filter(
      (item) => item.itemMeta.show
    );
  }

  showAllItems() {
    this.itemDisplayCount = this.sortedItems.length;
  }
}
