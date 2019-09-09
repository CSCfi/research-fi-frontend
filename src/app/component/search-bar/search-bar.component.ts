//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ViewChildren, ElementRef, OnInit, HostListener, OnDestroy, AfterViewInit, QueryList } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { AutosuggestService } from '../../services/autosuggest.service';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SingleItemService } from 'src/app/services/single-item.service';
import { ListItemComponent } from './list-item/list-item.component';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy, AfterViewInit {
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
  @ViewChildren(ListItemComponent) items: QueryList<any>;
  private keyManager: ActiveDescendantKeyManager<ListItemComponent>;

  docList = [
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

  additionalItems = ['clear'];

  constructor( public searchService: SearchService, private tabChangeService: TabChangeService,
               public router: Router, private eRef: ElementRef, private sortService: SortService,
               private autosuggestService: AutosuggestService, private singleService: SingleItemService ) {
                if (this.queryHistory) {this.queryHistory = Object.keys(sessionStorage); } else {this.queryHistory = []; }
  }

  ngOnInit() {
    this.fireAutoSuggest();
    window.addEventListener('keydown', this.escapeListener);
  }

  ngAfterViewInit() {
    this.keyManager = new ActiveDescendantKeyManager(this.items).withWrap().withTypeAhead();
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.escapeListener);
  }

  fireAutoSuggest() {
    this.queryField.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    )
    .subscribe(result => {
      this.keyManager = new ActiveDescendantKeyManager(this.items).withWrap().withTypeAhead();
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
          // console.log(this.topData);
        });
      } else {this.topData = []; this.otherData = []; }
    });
  }

  onKeydown(event) {
    // Listen for enter key and match with auto-suggest values
    if (event.keyCode === ENTER && this.keyManager.activeItem) {
      const doc = this.keyManager.activeItem.doc;
      const id = this.keyManager.activeItem.id || '';
      const term = this.keyManager.activeItem.term || undefined;
      const history = this.keyManager.activeItem.historyItem || undefined;
      const clear = this.keyManager.activeItem.clear || undefined;

      // Check for items that match current highlighted item
      if (doc && id) {
        this.singleService.updateId(id);
        this.searchService.singleInput = this.publicationSearchInput.nativeElement.value;
        this.router.navigate(['results/', doc, id || '']);
      } else if (doc && term) {
        this.searchService.singleInput = term.value;
        this.newInput(doc, undefined);
      } else if (history) {
        this.newInput(undefined, history);
      } else if (clear) {
        this.clearHistory();
        // Do search with current term if position is at empty list item
      } else {
        this.newInput(undefined, undefined);
      }
      this.showAutoSuggest = false;
    } else if (event.keyCode === ENTER) {
      this.newInput(undefined, undefined);
      this.showAutoSuggest = false;
      // Continue without action
    } else {
      this.keyManager.onKeydown(event);
    }
  }

  disableArrows(event) {
    if (event.keyCode === 40 ||  event.keyCode === 38) {
      this.showAutoSuggest = true;
      return false;
    }
  }

  // Hide auto suggest if clicked outside component
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showAutoSuggest = false;
    }
  }

  escapeListener = (e: any): void => {
    if (e.keyCode === 27 || e.keyCode === 9) {
      this.showAutoSuggest = false;
    }
  }

  newInput(selectedIndex, historyLink) {
    console.log('----');
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

  addToHistory(id: string) {
    this.showAutoSuggest = false;
    this.singleService.updateId(id);
    sessionStorage.setItem(this.currentInput, this.currentInput);
    this.searchService.singleInput = this.currentInput;
  }

  clearHistory() {
    sessionStorage.clear();
    this.showAutoSuggest = false;
  }
}
