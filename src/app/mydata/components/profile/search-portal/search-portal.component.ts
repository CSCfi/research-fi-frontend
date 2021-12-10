//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { SearchPortalService } from '@mydata/services/search-portal.service';
import { GroupTypes } from '@mydata/constants/groupTypes';

@Component({
  selector: 'app-search-researchFi',
  templateUrl: './search-portal.component.html',
  styleUrls: ['./search-portal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchPortalComponent implements OnInit {
  results: any;
  total: number;
  loading: boolean;
  currentSelection: any[];
  currentTerm: string;
  mobile: boolean;

  public fieldTypes = FieldTypes;
  public groupTypes = GroupTypes;

  addPublication = $localize`:@@addPublication:Lisää julkaisu`;
  addPublications = $localize`:@@addPublications:Lisää julkaisut`;

  addDataText: string;
  addDataPluralText: string;

  dialogTitle: string;
  searchHelpText: string;
  searchPlaceholder: string;

  searchForMissingPublication = $localize`:@@searchForMissingPublication:Puuttuvan julkaisun hakeminen`;
  searchForMissingDataset = $localize`:@@searchForMissingDataset:Puuttuvan tutkimusaineiston hakeminen`;
  searchForMissingFunding = $localize`:@@searchForMissingFunding:Puuttuvan hankkeen hakeminen`;

  searchForPublicationWithName = $localize`:@@searchForPublicationWithName:Hae omalla nimelläsi tai julkaisun nimellä`;
  searchForDatasetsWithName = $localize`:@@searchForDatasetWithName:Hae nimellä tai organisaatiolla`;
  searchForFundingsWithName = $localize`:@@searchForFundingWithName:Hae omalla nimelläsi tai hankkeen nimellä`;

  publicationSearchPlaceholder = $localize`:@@nameOfPublicationOrAuthor:Julkaisun tai tekijän nimi`;
  datasetSearchPlaceholder = $localize`:@@datasetSearchPlaceholder:Tekijän nimi / aineiston nimi / organisaation nimi`;
  fundingSearchPlaceholder = $localize`:@@enterPartOfName:Kirjoita osa nimestä`;

  constructor(
    private dialogRef: MatDialogRef<SearchPortalComponent>,
    private searchPortalService: SearchPortalService,
    private appSettingsService: AppSettingsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.setLocalizedContent();

    this.appSettingsService.mobileStatus
      .subscribe((status) => {
        this.mobile = status;
      })
      .unsubscribe();
  }

  setLocalizedContent() {
    switch (this.data.groupId) {
      case GroupTypes.publication: {
        this.dialogTitle = this.searchForMissingPublication;
        this.searchHelpText = this.searchForPublicationWithName;
        this.searchPlaceholder = this.publicationSearchPlaceholder;
        break;
      }
      case GroupTypes.dataset: {
        this.dialogTitle = this.searchForMissingDataset;
        this.searchHelpText = this.searchForDatasetsWithName;
        this.searchPlaceholder = this.datasetSearchPlaceholder;
        break;
      }
      case GroupTypes.funding: {
        this.dialogTitle = this.searchForMissingFunding;
        this.searchHelpText = this.searchForFundingsWithName;
        this.searchPlaceholder = this.fundingSearchPlaceholder;
        break;
      }
    }
  }

  handleSearch(term: string) {
    this.searchPortalService.updateSearchTerm(term);
    this.searchPortalService.updatePageSettings(null);
    this.currentTerm = term;
    this.search(term);
  }

  search(term: string) {
    this.results = [];
    this.loading = true;

    this.searchPortalService
      .getData(term, this.data.groupId)
      .pipe(take(1))
      .subscribe((result) => {
        this.results = result[this.data.groupId + 's'];
        this.total = result.total;
        this.loading = false;
      });
  }

  handleSelection(arr) {
    this.currentSelection = arr;
  }

  changePage(pageSettings: object) {
    this.searchPortalService.updatePageSettings(pageSettings);
    this.search(this.currentTerm);
  }

  sort(sortSettings) {
    this.searchPortalService.updateSort(this.data.groupId, sortSettings);
    this.search(this.currentTerm);
  }

  close() {
    this.dialogRef.close();
  }

  saveChanges() {
    let fieldType: number;

    switch (this.data.groupId) {
      case 'publication': {
        fieldType = this.fieldTypes.activityPublication;
        break;
      }
      case 'dataset': {
        fieldType = this.fieldTypes.activityDataset;
        break;
      }
      case 'funding': {
        fieldType = this.fieldTypes.activityFunding;
        break;
      }
    }

    const selection = this.currentSelection.map((item) => ({
      ...item,
      itemMeta: {
        id: item.id,
        type: fieldType,
        show: true,
        primaryValue: true,
      },
    }));

    this.dialogRef.close({ selection: selection });
  }
}
