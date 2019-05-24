//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {
  public searchTerm: any;
  public urlPageNumber: number;
  input: any = [];
  publicationData: any [];
  personData: any [];
  errorMessage = [];
  fromPage = 0;
  pageNumber = 1;
  page = 1;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;

  constructor( private searchService: SearchService, private router: Router, private route: ActivatedRoute ) {
    this.searchTerm = this.route.snapshot.params.input;
    this.searchService.getInput(this.searchTerm);
    this.publicationData = [];
    this.pageNumber = JSON.parse(localStorage.getItem('Pagenumber'));
    this.searchService.getPageNumber(this.pageNumber);
  }

  ngOnInit() {
    // local storage test
    console.log('local: ', this.pageNumber);

    // Get input
    this.searchService.currentInput.subscribe(input => this.input = input);

    // Reset pagination
    this.page = this.searchService.pageNumber;

    // If url is missing search term
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }

    this.fromPage = this.page * 10 - 10;

    this.getPublicationData();
    this.getPersonData();

    // Listen for search button action on results page
    if (this.input !== null || this.searchService.subsVar === undefined) {
      this.searchService.subsVar = this.searchService.
      invokeGetData.subscribe(() => {
        // Reset pagination
        this.fromPage = 0;
        this.urlPageNumber = 1;
        this.page = 1;
        this.searchService.getPageNumber(1);
        // Get search data
        this.getPublicationData();
        this.getPersonData();
      });
    }

  }

  getPersonData() {
    this.searchService.getPersons()
    .pipe(map(personData => [personData]))
    .subscribe(personData => this.personData = personData,
      error => this.errorMessage = error as any);
  }

  getPublicationData() {
    this.searchService.getPublications()
    .pipe(map(publicationData => [publicationData]))
    .subscribe(publicationData => this.publicationData = publicationData,
      error => this.errorMessage = error as any);
  }

  nextPage() {
    this.page++;
    this.fromPage = this.page * 10 - 10;
    localStorage.setItem('Pagenumber', JSON.stringify(this.page));
    this.searchService.getPageNumber(this.page);
    this.getPublicationData();

  }

  previousPage() {
    this.page--;
    this.fromPage = this.fromPage - 10;
    localStorage.setItem('Pagenumber', JSON.stringify(this.page));
    this.searchService.getPageNumber(this.page);
    this.getPublicationData();
  }

  // Unsubscribe from search term to prevent memory leaks
  ngOnDestroy() {
    this.searchService.subsVar.unsubscribe();
  }

}
