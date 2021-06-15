//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PublicationsService } from '@mydata/services/publications.service';
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

  constructor(
    private dialogRef: MatDialogRef<SearchPublicationsComponent>,
    private publicationService: PublicationsService
  ) {}

  ngOnInit(): void {}

  handleSearch(term) {
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

  changePage(pageSettings) {
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
    this.dialogRef.close({
      selectedPublications: this.currentSelection,
    });
  }
}
