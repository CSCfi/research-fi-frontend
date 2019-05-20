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

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {
  input: any = [];
  isSearching: boolean;
  publicationData: any [];
  personData: any [];
  errorMessage = [];
  status = false;
  fromPage = 0;
  page = 1;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;

  constructor( private searchService: SearchService, private router: Router ) {
    this.isSearching = false;
    this.publicationData = [];
  }

  ngOnInit() {
    // Get input
    this.searchService.currentInput.subscribe(input => this.input = input);

    // Reset pagination
    this.searchService.from = 0;
    this.page = 1;

    // Get search data when coming from other than results page
    this.getPublicationData();
    this.getPersonData();

    // Listen for search button action on results page
    if (this.input !== null || this.searchService.subsVar === undefined) {
      this.searchService.subsVar = this.searchService.
      invokeGetData.subscribe(() => {
        // Reset pagination
        this.searchService.from = 0;
        this.fromPage = 0;
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

  increaseEvent(i: number): void {
    this.status = !this.status;
  }

  nextPage() {
    this.fromPage = this.fromPage + 10;
    this.page = this.page + 1;
    this.searchService.nextFrom();
    this.getPublicationData();
    this.router.navigate(['results/' + this.input + '&page' + this.page]);
  }

  previousPage() {
    this.fromPage = this.fromPage - 10;
    this.page = this.page - 1;
    this.searchService.previousFrom();
    this.getPublicationData();
    this.router.navigate(['results/' + this.input + '&page' + this.page]);
  }

  // Unsubscribe from search term to prevent memory leaks
  ngOnDestroy() {
    this.searchService.subsVar.unsubscribe();
  }

}
