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
import { NgFor, NgIf, LowerCasePipe, NgClass, JsonPipe } from '@angular/common';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { HasSelectedItemsPipe } from '@mydata/pipes/has-selected-items.pipe';
import { TertiaryButtonComponent } from '@shared/components/buttons/tertiary-button/tertiary-button.component';
import { FilterLimitButtonComponent } from '@portal/components/filter-limit-button/filter-limit-button.component';

@Component({
    selector: 'app-summary-portal-items',
    templateUrl: './summary-portal-items.component.html',
  styleUrls: ['./summary-portal-items.component.scss'],
    standalone: true,
  imports: [
    NgFor,
    NgIf,
    PanelArrayItemComponent,
    SummaryDividerComponent,
    MatButton,
    LowerCasePipe,
    NgClass,
    JsonPipe,
    HasSelectedItemsPipe,
    TertiaryButtonComponent,
    FilterLimitButtonComponent
  ]
})

export class SummaryPortalItemsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldType: any;
  @Input() sortField: string;
  @Input() showMoreLabel: string;
  fieldTypes = FieldTypes;

  sortItemsByNew = sortItemsByNew;
  sortedItems: any[] = [];
  yearsList = new Set([]);

  itemDisplayCount = 3;

  showMorePrefix = $localize`:@@showAll:Näytä kaikki`;
  showLessPrefix = $localize`:@@showLess:Näytä vähemmän`;

  constructor() {}


  comparePublicationYearsPublications(a, b) {
    return a.publicationYear - b.publicationYear;
  }

  comparePublicationYearsDataset(a, b) {
    return a.year - b.year;
  }

  ngOnInit(): void {
    // User can have duplicate publications, one from ORCID and one from Research.fi
    // Merge these and display only one
    const dataCopy = cloneDeep(this.data);

    if (this.fieldType === FieldTypes.activityPublication) {
      this.data.items = this.data.items.sort(this.comparePublicationYearsPublications).reverse();
    }

    if (this.fieldType === FieldTypes.activityDataset) {
      this.data.items = this.data.items.sort(this.comparePublicationYearsDataset).reverse();
    }

    if (this.fieldType === FieldTypes.activityFunding) {
      this.data.items = this.data.items.sort(this.comparePublicationYearsDataset).reverse();
    }

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

  showLessItems() {
    this.itemDisplayCount = 3;
  }


  protected readonly FieldTypes = FieldTypes;
}
