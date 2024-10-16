//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { mergePublications, sortItemsByNew } from '@mydata/utils';
import { cloneDeep } from 'lodash-es';
import { MatButton } from '@angular/material/button';
import { SummaryDividerComponent } from '../summary-divider/summary-divider.component';
import { PanelArrayItemComponent } from '../../profile-panel/panel-array-item/panel-array-item.component';
import { NgFor, NgIf, LowerCasePipe } from '@angular/common';

@Component({
    selector: 'app-summary-portal-items',
    templateUrl: './summary-portal-items.component.html',
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        PanelArrayItemComponent,
        SummaryDividerComponent,
        MatButton,
        LowerCasePipe,
    ],
})
export class SummaryPortalItemsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldType: any;
  @Input() sortField: string;
  @Input() showMoreLabel: string;

  sortItemsByNew = sortItemsByNew;
  sortedItems: any[] = [];

  itemDisplayCount = 3;

  showMorePrefix = $localize`:@@showAll:Näytä kaikki`;

  constructor() {}

  ngOnInit(): void {
    // User can have duplicate publications, one from ORCID and one from Research.fi
    // Merge these and display only one
    const dataCopy = cloneDeep(this.data);

    if (dataCopy.id === 'publication') {
      // mergePublications(dataCopy);
    }

    // Display only selected items
    if (dataCopy?.items) {
      this.sortedItems = this.sortItemsByNew(
        dataCopy.items,
        this.sortField
      ).filter((item) => item.itemMeta.show);
    }
  }

  showAllItems() {
    this.itemDisplayCount = this.sortedItems.length;
  }
}
