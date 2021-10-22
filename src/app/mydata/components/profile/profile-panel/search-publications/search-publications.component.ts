//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicationsService } from '@mydata/services/publications.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search-publications',
  templateUrl: './search-publications.component.html',
  styleUrls: ['./search-publications.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchPublicationsComponent implements OnInit {
  results: any;
  total: number;
  loading: boolean;
  currentSelection: any[];
  currentTerm: string;
  mobile: boolean;

  constructor(
    private dialogRef: MatDialogRef<SearchPublicationsComponent>,
    private publicationService: PublicationsService,
    private appSettingsService: AppSettingsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.appSettingsService.mobileStatus
      .subscribe((status) => {
        this.mobile = status;
      })
      .unsubscribe();
  }

  handleSearch(term: string) {
    this.publicationService.updateSearchTerm(term);
    this.publicationService.updatePageSettings(null);
    this.currentTerm = term;
    this.searchPublications(term);
  }

  searchPublications(term: string) {
    this.results = [];
    this.loading = true;

    this.publicationService
      .getPublications(term)
      .pipe(take(1))
      .subscribe((result) => {
        this.results = result.hits.hits;
        this.total = result.hits.total.value;
        this.loading = false;
      });
  }

  handleSelection(arr) {
    this.currentSelection = arr;
  }

  changePage(pageSettings: object) {
    this.publicationService.updatePageSettings(pageSettings);
    this.searchPublications(this.currentTerm);
  }

  sort(sortSettings) {
    this.publicationService.updateSort(sortSettings);
    this.searchPublications(this.currentTerm);
  }

  close() {
    this.dialogRef.close();
  }

  saveChanges() {
    const selectedPublications = this.currentSelection.map((item) => ({
      publicationId: item.publicationId,
      publicationName: item.publicationName,
      publicationYear: item.publicationYear,
      itemMeta: { id: item.publicationId, show: true, primaryValue: true },
      // itemMeta: { id: null, show: true, primaryValue: true }, id null, testing for draft summary
    }));

    this.dialogRef.close({ selectedPublications: selectedPublications });

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
