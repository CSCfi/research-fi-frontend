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
  @Input() highlightOpenness: boolean;
  fieldTypes = FieldTypes;

  sortItemsByNew = sortItemsByNew;
  sortedItems: any[] = [];
  yearsList = new Set([]);

  itemDisplayCount = 3;

  showMorePrefix = $localize`:@@showAll:Näytä kaikki`;
  showLessPrefix = $localize`:@@showLess:Näytä vähemmän`;

  hasOpenPublications = false;

  constructor() {
  }


  comparePublicationYearsPublications(a, b) {
    return a.publicationYear - b.publicationYear;
  }

  comparePublicationYearsDatasetOrFunding(a, b) {
    return a.year - b.year;
  }

  arrangeOpenPublicationsFirst(a, b) {
    //console.log('SORT OPEN FIRST', a, b);
    // A is open access and B not
    if ((a.openAccess !== 0 || a.selfArchivedCode !== '0') && !(b.openAccess !== 0 || b.selfArchivedCode !== '0')) {
      return -1;
    }
    // A is not open access and B is
    else if (!(a.openAccess !== 0 || a.selfArchivedCode !== '0') && (b.openAccess !== 0 || b.selfArchivedCode !== '0')) {
      return 1;
    }
    return 0;
  }

  ngOnInit(): void {
    let dataCopy = cloneDeep(this.data);

    if (this.fieldType === FieldTypes.activityPublication) {
      if (this.highlightOpenness && dataCopy?.items) {
        const openPublications = dataCopy.items.filter(item => item.openAccess !== 0 || (item.selfArchivedCode && item.selfArchivedCode !== '0')).sort(this.comparePublicationYearsPublications).reverse();
        this.hasOpenPublications = (openPublications.length > 0);
        const nonOpenPublications = dataCopy.items.filter(item => !(item.openAccess !== 0 || (item.selfArchivedCode && item.selfArchivedCode !== '0'))).sort(this.comparePublicationYearsPublications).reverse();
        const concatPublications = openPublications.concat(nonOpenPublications);

        // Add tag to mark row has a caption
        if (nonOpenPublications.length > 0) nonOpenPublications[0].nonOpenCaptionRow = true;
        dataCopy.items = cloneDeep(concatPublications);
      }
    }

    if (this.fieldType === FieldTypes.activityDataset) {
      dataCopy.items = dataCopy.items.sort(this.comparePublicationYearsDatasetOrFunding).reverse();
    }

    if (this.fieldType === FieldTypes.activityFunding) {
      dataCopy.items = dataCopy.items.sort(this.comparePublicationYearsDatasetOrFunding).reverse();
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
