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
  page = 1;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;

  constructor( private searchService: SearchService, private router: Router, private route: ActivatedRoute,
               private location: Location) {
    this.searchTerm = this.route.snapshot.params.input;
    this.searchService.getInput(this.searchTerm);
    this.urlPageNumber = this.route.snapshot.params.page;
    this.searchService.getPageNumber(this.urlPageNumber);
    this.publicationData = [];
    this.route.params.subscribe( params => console.log(params) );
  }

  ngOnInit() {
    console.log('ngOnInit start: ', this.urlPageNumber);
    // Get input
    this.searchService.currentInput.subscribe(input => this.input = input);

    // Reset pagination
    this.searchService.from = 0;
    this.page = this.urlPageNumber;
    console.log('page: ', this.page);

    // If url is missing search term
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
      this.router.navigate(['results', this.searchTerm, 1]);
    }

    // If url is missing page number
    if (this.urlPageNumber === undefined) {
      
      console.log('missing page number');
    }

    this.fromPage = this.page * 10 - 10;

    if (this.urlPageNumber !== undefined) {
      console.log('onInit');
      // Get search data when coming from other than results page
      this.getPublicationData();
      this.getPersonData();
    }

    // Listen for search button action on results page
    if (this.input !== null || this.searchService.subsVar === undefined) {
      this.searchService.subsVar = this.searchService.
      invokeGetData.subscribe(() => {
        // Reset pagination
        this.searchService.from = 0;
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
    // if (this.page === undefined) {
    //   this.page = 1;
    //   this.fromPage = this.fromPage + 10;
    //   console.log('aa', this.searchTerm);
    //   this.router.navigate(['results', this.searchTerm, 2]);
    // } else {
    console.log('nextPage');
    this.page++;
    this.urlPageNumber = this.page;
    this.fromPage = this.page * 10 - 10;
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    this.router.navigate(['results/', this.searchTerm, this.page]);
    this.getPublicationData();

  }

  previousPage() {
    this.page--;
    this.urlPageNumber = this.page;
    this.fromPage = this.fromPage - 10;
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    this.router.navigate(['results/', this.searchTerm, this.page]);
    this.getPublicationData();
  }

  // Unsubscribe from search term to prevent memory leaks
  ngOnDestroy() {
    this.searchService.subsVar.unsubscribe();
  }

}
