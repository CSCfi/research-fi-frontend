//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { mergePublications, sortItemsBy } from '@mydata/utils';
import { cloneDeep } from 'lodash-es';

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
    // User can have duplicate publications, one from ORCID and one from Research.fi
    // Merge these and display only one
    const dataCopy = cloneDeep(this.data);

    if (dataCopy.id === 'publications') {
      mergePublications(dataCopy);
    }

    // Display only selected items
    this.sortedItems = this.sortItemsBy(dataCopy, this.sortField).filter(
      (item) => item.itemMeta.show
    );
  }

  showAllItems() {
    this.itemDisplayCount = this.sortedItems.length;
  }
}
