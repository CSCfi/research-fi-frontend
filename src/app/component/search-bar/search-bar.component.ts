//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { AutosuggestService } from '../../services/autosuggest.service';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';


@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  @ViewChild('publicationSearchInput') publicationSearchInput: ElementRef;
  input: string;
  sub: Subscription;
  autoSuggestResponse: any;
  topData: any;
  otherData: any[];
  queryField: FormControl = new FormControl();
  currentInput: any;
  showAutoSuggest = false;
  queryHistory: any;

  indices = [
    {index: 'publication', field: 'publicationName', link: 'publicationId'},
    {index: 'person', field: 'lastName'},
    {index: 'funding', field: 'projectNameFi', link: 'projectId'},
    {index: 'organization', field: 'nameFi', link: 'organizationId'}
  ];

  translations = {
    publication: 'julkaisut',
    person: 'tutkijat',
    funding: 'rahoitetut hankkeet',
    organization: 'tutkimusorganisaatiot'
  };


  constructor( public searchService: SearchService, private tabChangeService: TabChangeService,
               public router: Router, private eRef: ElementRef, private sortService: SortService,
               private autosuggestService: AutosuggestService ) {
                this.queryHistory = Object.keys(sessionStorage).reverse();
  }

  ngOnInit() {
    this.fireAutoSuggest();
    // console.log(this.queryHistory)
  }

  fireAutoSuggest() {
    this.queryField.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    )
    .subscribe(result => {
      if (result.length > 0) {this.showAutoSuggest = true; } else {this.showAutoSuggest = false; }
      this.queryHistory = Object.keys(sessionStorage).reverse();
      this.currentInput = result;
      if (result.length > 2) {
        this.autosuggestService.search(result).pipe(map(response => [response]))
        .subscribe(response => {
          // Set auto suggest to visible
          this.showAutoSuggest = true;
          // Sort indices with highest doc count
          const arr = [];
          this.autoSuggestResponse = response;
          const source = this.autoSuggestResponse[0].aggregations._index.buckets;
          Object.keys(source).sort((a, b) => source[b].doc_count - source[a].doc_count)
          .forEach((key) => {
            arr.push({index: key, source: source[key], translation: this.translations[key]});
          });
          // Show hits for top 2 indices with most results
          this.topData = arr.slice(0, 2);
          // Todo: Change value to 5 when all indices are added
          this.otherData = arr.slice(2);
        });
      } else {this.topData = []; this.otherData = []; }
    });
  }

  // Hide auto suggest if clicked outside component
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showAutoSuggest = false;
    }
  }

  newInput(selectedIndex, historyLink) {
    // Set input to session storage & assign list to variable
    sessionStorage.setItem(this.currentInput, this.currentInput);

    this.showAutoSuggest = false;
    this.sortService.sortMethod = 'desc';
    this.searchService.updatePageNumber(1);
    // Don't trigger subscriptions, just update search term
    // If query history link is clicked, send value to service and navigate
    if (historyLink) {
      this.searchService.singleInput = historyLink;
    } else {
      this.searchService.singleInput = this.publicationSearchInput.nativeElement.value;
    }
    this.searchService.getTabValues().subscribe((data: any) => {
      this.searchService.tabValues = data;
      this.searchService.redirecting = true;
      // Termporary default to publications
      // Change tab if clicked from auto suggest
      if (selectedIndex) {this.router.navigate(['results/', selectedIndex + 's', this.searchService.singleInput || '']); } else {
        this.router.navigate(['results/', this.tabChangeService.tab || 'publications', this.searchService.singleInput || '']);
      }
    });
  }

  addToHistory() {
    sessionStorage.setItem(this.currentInput, this.currentInput);
    // this.searchService.singleInput = this.currentInput;
  }

  clearHistory() {
    sessionStorage.clear();
    this.showAutoSuggest = false;
  }
}
