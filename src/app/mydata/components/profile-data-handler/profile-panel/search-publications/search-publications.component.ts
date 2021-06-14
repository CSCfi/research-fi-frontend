//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PublicationsService } from '@mydata/services/publications.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search-publications',
  templateUrl: './search-publications.component.html',
  styleUrls: ['./search-publications.component.scss'],
})
export class SearchPublicationsComponent implements OnInit {
  results: any;
  total: number;
  loading: boolean;
  currentSelection: any[];

  constructor(
    private dialogRef: MatDialogRef<SearchPublicationsComponent>,
    private publicationService: PublicationsService
  ) {}

  ngOnInit(): void {}

  searchPublications(term) {
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

  close() {
    this.dialogRef.close();
  }

  saveChanges() {
    this.dialogRef.close({
      selectedPublications: this.currentSelection,
    });
  }
}
