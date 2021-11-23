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

  fieldTypes = FieldTypes;

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
  searchForDatasetsWithName = $localize`:@@searchForDatasetWithName:Hae omalla nimelläsi tai tutkimusaineiston nimellä`;
  searchForFundingsWithName = $localize`:@@searchForFundingWithName:Hae omalla nimelläsi tai hankkeen nimellä`;

  publicationSearchPlaceholder = $localize`:@@nameOfPublicationOrAuthor:Julkaisun tai tekijän nimi`;
  datasetSearchPlaceholder = $localize`:@@nameOfDatasetOrAuthor:Tutkimusaineiston tai tekijän nimi`;
  fundingSearchPlaceholder = $localize`:@@nameOfFundingOrAuthor:Name of funding or author`;

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
      case 'publication': {
        this.dialogTitle = this.searchForMissingPublication;
        this.searchHelpText = this.searchForPublicationWithName;
        this.searchPlaceholder = this.publicationSearchPlaceholder;
        break;
      }
      case 'dataset': {
        this.dialogTitle = this.searchForMissingDataset;
        this.searchHelpText = this.searchForDatasetsWithName;
        this.searchPlaceholder = this.datasetSearchPlaceholder;
        break;
      }
      case 'funding': {
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
    console.log(arr);
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
    const selection = this.currentSelection.map((item) => ({
      id: item.id,
      title: item.title || item.name,
      year: item.year,
      itemMeta: {
        id: item.id,
        type: this.fieldTypes.activityPublication,
        show: true,
        primaryValue: true,
      },
      // itemMeta: { id: null, show: true, primaryValue: true }, id null, testing for draft summary
    }));

    this.dialogRef.close({ selection: selection });

    // const publications = this.currentSelection.map((item) => ({
    //   publicationId: item.publicationId,
    //   show: true,
    //   primaryValue: true,
    // }));

    // this.publicationService
    //   .addPublications(publications)
    //   .pipe(take(1))
    //   .subscribe((res: any) => {
    //     if (res.ok && res.body.success) {
    //       const data = res.body.data;

    //       const preSelection = this.data.selectedPublications;

    //       const sortPublications = (publications) => {
    //         return publications.sort(
    //           (a, b) => b.publicationYear - a.publicationYear
    //         );
    //       };

    //       this.dialogRef.close({
    //         selectedPublications: preSelection
    //           ? sortPublications(data.publicationsAdded.concat(preSelection))
    //           : sortPublications(data.publicationsAdded),
    //         publicationsNotFound: data.publicationsNotFound,
    //         publicationsAlreadyInProfile: data.publicationsAlreadyInProfile,
    //         source: data.source,
    //       });
    //     }
    //   });
  }
}
