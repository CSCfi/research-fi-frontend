//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {
  public searchTerm: any;
  input: any = [];
  publicationData: any [];
  personData: any [];
  fundingData: any [];
  errorMessage = [];
  fromPage = 0;
  pageNumber = 1;
  page = 1;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private titleService: Title ) {
    this.searchTerm = this.route.snapshot.params.input;
    this.searchService.getInput(this.searchTerm);
    this.publicationData = [];
    // Get page number from local storage
    this.pageNumber = JSON.parse(localStorage.getItem('Pagenumber'));
    this.searchService.getPageNumber(this.pageNumber);
  }
  
  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    // Set title
    this.setTitle('Julkaisut - (' + 'x' + ' hakutulosta) - Haku - Tutkimustietovaranto');
    this.srHeader.nativeElement.innerHTML = document.title.split(" - ", 2).join(" - ");

    // Get input
    this.searchService.currentInput.subscribe(input => this.input = input);
    
    // Reset pagination
    this.page = this.searchService.pageNumber;
    
    // If url is missing search term, might not be necessary
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    
    this.fromPage = this.page * 10 - 10;
    
    this.getPublicationData();
    this.getPersonData();
    this.getFundingData();


    // Listen for search button action on results page
    if (this.input !== null || this.searchService.subsVar === undefined) {
      this.searchService.subsVar = this.searchService.
      invokeGetData.subscribe(() => {
        // Reset pagination
        this.fromPage = 0;
        this.page = 1;
        this.searchService.getPageNumber(1);
        // Get search data
        this.getPublicationData();
        this.getPersonData();
        this.getFundingData();
      });
    }

  }

  getPublicationData() {
    this.searchService.getPublications()
    .pipe(map(publicationData => [publicationData]))
    .subscribe(publicationData => this.publicationData = publicationData,
      error => this.errorMessage = error as any);
    console.log(this.publicationData);
  }

  getPersonData() {
    this.searchService.getPersons()
    .pipe(map(personData => [personData]))
    .subscribe(personData => this.personData = personData,
      error => this.errorMessage = error as any);
  }

  getFundingData() {
    this.searchService.getFundings()
    .pipe(map(fundingData => [fundingData]))
    .subscribe(fundingData => this.fundingData = fundingData,
      error => this.errorMessage = error as any);
  }

  nextPage() {
    this.page++;
    this.fromPage = this.page * 10 - 10;
    // Set page number to local storage
    localStorage.setItem('Pagenumber', JSON.stringify(this.page));
    // Send to search service
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

  updateTitle(event) {
    // Update title and <h1> with the information of the currently selected tab
    // Regex to match the bracketed numbers
    var re: RegExp = /\((\d*)\)/;
    this.setTitle(event.tab.textLabel.replace(re, " - ($1 hakutulosta)") + ' - Haku - Tutkimustietovaranto');
    this.srHeader.nativeElement.innerHTML = document.title.split(" - ", 2).join(" - ");
  }

  // Unsubscribe from search term to prevent memory leaks
  ngOnDestroy() {
    this.searchService.subsVar.unsubscribe();
  }

}
