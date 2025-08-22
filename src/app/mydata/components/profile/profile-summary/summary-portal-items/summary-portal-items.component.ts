//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
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
import { MatCheckbox } from '@angular/material/checkbox';

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
    FilterLimitButtonComponent,
    MatCheckbox
  ]
})

export class SummaryPortalItemsComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() fieldType: any;
  @Input() sortField: string;
  @Input() showMoreLabel: string;
  @Input() highlightOpenness: boolean;
  @Input() isPortalSinglePage: boolean;
  fieldTypes = FieldTypes;

  sortItemsByNew = sortItemsByNew;
  sortedItems: any[] = [];
  sortedItemsTemp: any[] = [];
  yearsList = new Set([]);

  itemDisplayCount = 3;

  showOnlyPeerReviewed  = $localize`:@@showOnlyPeerReviewed:Näytä vain vertaisarvioidut`;
  noPeerReviewedPublications = $localize`:@@noPeerReviewedPublications:Ei vertaisarvioituja julkaisuja`;

  showMorePrefix = $localize`:@@showAll:Näytä kaikki`;
  showLessPrefix = $localize`:@@showLess:Näytä vähemmän`;

  openAccessPublications = $localize`:@@openAccessPublications:Avoimesti saatavilla olevat julkaisut`;
  otherPublications = $localize`:@@otherPublications:Muut julkaisut`;
  noOpenAccessPublications = $localize`:@@noOpenPublicationAvailable:Ei avoimesti saatavilla olevia julkaisuja`;

  hasOpenPublications = false;
  filterPeerReviewedPublications = false;

  constructor() {
  }

  isPeerReviewed(publicationTypeCode: any){
    return (publicationTypeCode && (publicationTypeCode[0] === 'A' || publicationTypeCode[0] === 'C'));
  }

  ngOnChanges(): void {
    this.init();
  }
  
  togglePeerReviewedFilter(){
    this.filterPeerReviewedPublications = !this.filterPeerReviewedPublications;
    this.init();
  }

  doPeerReviewedPublicationsFiltering(){
    if (this.filterPeerReviewedPublications){
      this.sortedItemsTemp = cloneDeep(this.sortedItems);
      this.sortedItems = this.sortedItems.filter((item) => this.isPeerReviewed(item?.publicationTypeCode));
    }
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

  ngOnInit() {
    this.init();
  }

  init(): void {
    const dataCopy = cloneDeep(this.data);

    //this.doPeerReviewedPublicationsFiltering();

    if (this.fieldType === FieldTypes.activityPublication) {
      if (this.highlightOpenness && dataCopy?.items) {
        let openPublications = dataCopy.items.filter(item => item.openAccess !== 0 || (item.selfArchivedCode && item.selfArchivedCode !== '0')).sort(this.comparePublicationYearsPublications).reverse();
        if (openPublications.length > 0) {
          openPublications = openPublications.filter((item) => item.itemMeta.show);
          this.hasOpenPublications = (openPublications.length > 0);
        } else {
          this.hasOpenPublications = false;
        }

        const nonOpenPublications = dataCopy.items.filter(item => !(item.openAccess !== 0 || (item.selfArchivedCode && item.selfArchivedCode !== '0'))).sort(this.comparePublicationYearsPublications).reverse();
        const concatPublications = openPublications.concat(nonOpenPublications);

        // Add tag to mark row has a caption
        if (nonOpenPublications.length > 0) nonOpenPublications[0].nonOpenCaptionRow = true;
        dataCopy.items = cloneDeep(concatPublications);
        this.sortedItems = dataCopy.items.filter((item) => item.itemMeta.show);
      }
      else if (dataCopy?.items?.length > 0) {
        this.sortedItems = dataCopy.items.filter((item) => item.itemMeta.show).sort(this.comparePublicationYearsPublications).reverse();
      }
      this.doPeerReviewedPublicationsFiltering();
    }

    else {
      if (this.fieldType === FieldTypes.activityDataset) {
        dataCopy.items = dataCopy.items.sort(this.comparePublicationYearsDatasetOrFunding).reverse();
      }

      if (this.fieldType === FieldTypes.activityFunding) {
        dataCopy.items = dataCopy.items.sort(this.comparePublicationYearsDatasetOrFunding).reverse();
      }

      if (dataCopy.id === 'publication') {
        //mergePublications(dataCopy);
      }

      // Display only selected items
      if (dataCopy?.items) {
        this.sortedItems = this.sortItemsByNew(
          dataCopy.items,
          this.sortField
        ).filter((item) => item.itemMeta.show);
      }
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
