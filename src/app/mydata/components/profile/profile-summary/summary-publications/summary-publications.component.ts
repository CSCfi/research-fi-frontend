//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { sortItemsBy } from '@mydata/utils';

@Component({
  selector: 'app-summary-publications',
  templateUrl: './summary-publications.component.html',
})
export class SummaryPublicationsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldTypes: any;

  sortItemsBy = sortItemsBy;
  sortedItems: any[];

  publicationDisplayCount = 3;

  constructor() {}

  ngOnInit(): void {
    // Sort and filter publications that shoudd be displayed
    this.sortedItems = this.sortItemsBy(this.data, 'publicationYear').filter(
      (item) => item.itemMeta.show
    );
  }

  showAllPublications() {
    this.publicationDisplayCount = this.sortedItems.length;
  }
}
