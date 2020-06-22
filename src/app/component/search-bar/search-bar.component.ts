//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ViewChildren, ElementRef, OnInit, HostListener, Inject, AfterViewInit, QueryList,
  PLATFORM_ID, ViewEncapsulation, LOCALE_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { AutosuggestService } from '../../services/autosuggest.service';
import { TabChangeService } from '../../services/tab-change.service';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SingleItemService } from '../../services/single-item.service';
import { ListItemComponent } from './list-item/list-item.component';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { SettingsService } from 'src/app/services/settings.service';
import { UtilityService } from 'src/app/services/utility.service';
import { FilterService } from 'src/app/services/filter.service';

interface Target {
  value: string;
  viewValueFi: string;
  viewValueEn: string;
  viewValueSv: string;
}

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class SearchBarComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild('inputGroup', { static: true }) inputGroup: ElementRef;
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;
  input: string;
  sub: Subscription;
  autoSuggestResponse: any;
  topData: any;
  otherData: any[];
  queryField: FormControl = new FormControl();
  currentInput: any;
  showAutoSuggest = false;
  queryHistory: any;
  showHelp = false;
  @ViewChildren(ListItemComponent) items: QueryList<any>;
  private keyManager: ActiveDescendantKeyManager<ListItemComponent>;

  docList = [
    {index: 'publication', field: 'publicationName', link: 'publicationId'},
    {index: 'funding', field: 'projectNameFi', link: 'projectId'},
    {index: 'infrastructure', field: 'name', link: 'name'},
    {index: 'organization', field: 'nameFi', link: 'organizationId'}
  ];

  translations = {
    publication: $localize`:@@publications:julkaisut`,
    person: $localize`:@@authors:tutkijat`,
    funding: $localize`:@@fundings:rahoitetut hankkeet`,
    infrastructure: $localize`:@@infrastructures:infrastruktuurit`,
    organization: $localize`:@@organizations:tutkimusorganisaatiot`
  };

  targets: Target[] = [
    {value: 'all', viewValueFi: 'Koko sisältö', viewValueEn: 'All content', viewValueSv: ''},
    {value: 'name', viewValueFi: 'Henkilön nimi', viewValueEn: 'Person name', viewValueSv: ''},
    {value: 'title', viewValueFi: 'Otsikko', viewValueEn: 'Title', viewValueSv: ''},
    {value: 'keywords', viewValueFi: 'Avainsanat', viewValueEn: 'Keywords', viewValueSv: ''},
    {value: 'organization', viewValueFi: 'Organisaatio', viewValueEn: 'Organization', viewValueSv: ''},
    {value: 'funder', viewValueFi: 'Rahoittaja', viewValueEn: 'Funder', viewValueSv: ''}
  ];

  additionalItems = ['clear'];
  completion: string;
  inputMargin: string;
  isBrowser: boolean;
  currentTab: { data: string; labelFi: string; labelEn: string; link: string; icon: string; };
  selectedTab: string;
  routeSub: Subscription;
  topMargin: any;
  currentTerm: string;
  inputSub: Subscription;
  queryParams: any;
  selectedTarget: any;
  currentLocale: any;

  constructor( public searchService: SearchService, private tabChangeService: TabChangeService, private route: ActivatedRoute,
               public router: Router, private eRef: ElementRef, private sortService: SortService,
               private autosuggestService: AutosuggestService, private singleService: SingleItemService,
               @Inject(DOCUMENT) private document: any, @Inject(PLATFORM_ID) private platformId: object,
               private settingService: SettingsService, public utilityService: UtilityService,
               @Inject(LOCALE_ID) protected localeId, private filterService: FilterService ) {
                // Capitalize first letter of locale
                this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
                this.queryHistory = this.getHistory();
                this.completion = '';
                this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.selectedTarget = params.target ? params.target : null;
      this.queryParams = params;
      this.topMargin = this.searchBar.nativeElement.offsetHight + this.searchBar.nativeElement.offsetTop;
    });
    // Get previous search term and set it to form control value
    this.inputSub = this.searchService.currentInput.subscribe(input => this.currentTerm = input);
    this.queryField = new FormControl(this.currentTerm);
  }

  ngAfterViewInit() {
    // Get items for list
    this.keyManager = new ActiveDescendantKeyManager(this.items).withWrap().withTypeAhead();

    this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'search-input') {
        this.searchInput.nativeElement.focus();
      }
    });
  }

  onFocus() {
    this.fireAutoSuggest();
    // Show auto-suggest when input in focus
    this.showAutoSuggest = true;
    // Hides query history if search term isn't altered after history clear button click
    this.queryHistory = this.getHistory();
    // Set queryfield value to trigger subscription and fetch suggestions
    this.queryField.setValue(this.searchInput.nativeElement.value);
    this.setCompletionWidth();
  }

  fireAutoSuggest() {
    this.queryField.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    )
    .subscribe(result => {
      this.keyManager = new ActiveDescendantKeyManager(this.items).withWrap().withTypeAhead();
      this.currentInput = result;
      if (result.length > 2) {
        this.autosuggestService.search(result).pipe(map(response => [response]))
        .subscribe(response => {
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
          this.otherData = arr.slice(3);
          // Completion
          this.getCompletion();
        });
        // Reset data
      } else {this.topData = []; this.otherData = []; this.completion = ''; }
    });
  }

  // Keycodes
  onKeydown(event) {
    this.completion = '';
    this.showAutoSuggest = true;
    // Listen for enter key and match with auto-suggest values
    if (event.keyCode === 13 && this.keyManager.activeItem) {
      const doc = this.keyManager.activeItem.doc;
      const id = this.keyManager.activeItem.id || '';
      const term = this.keyManager.activeItem.term || undefined;
      const history = this.keyManager.activeItem.historyItem || undefined;
      const clear = this.keyManager.activeItem.clear || undefined;
      // Set focus to tab skip-link via service
      this.setFocus();

      // Check for items that match current selected item
      if (doc && id) {
        this.singleService.updateId(id);
        this.searchService.updateInput(this.searchInput.nativeElement.value);
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
      // Search with no suggests
    } else if (event.keyCode === 13) {
      this.newInput(undefined, undefined);
      // Set focus to skip-to link
      this.setFocus();
      // Continue without action. For some reason letter 'n' registers as down arrow, hacky fix:
    } else if (event.keyCode !== 78)  {
      this.keyManager.onKeydown(event);
    }
    // Hide auto-suggest with esc key
    if (event.keyCode === 27) {
      this.showAutoSuggest = false;
    }
    // Reset completion with right arrow key
    if (event.keyCode === 39) {
      this.addCompletion();
    }
  }

  setFocus() {
    this.tabChangeService.changeFocus(true);
  }

  getCompletion() {
    // Get first result from completions
    let completionData = this.autoSuggestResponse[0].suggest.mySuggestions[0].options[0] ?
    this.autoSuggestResponse[0].suggest.mySuggestions[0].options[0].text : '';
    // Get second completion suggest if first is same as input
    if (completionData === this.searchInput.nativeElement.value) {
      completionData = this.autoSuggestResponse[0].suggest.mySuggestions[0].options[1] ?
      this.autoSuggestResponse[0].suggest.mySuggestions[0].options[1].text : '';
    }
    // Replace characters other than alphabetical letters
    if (!completionData.match(/^[A-Z]/i)) {
      completionData = completionData.replace(/[\W_0-9]+/g, '');
    }
    this.completion = completionData.slice(this.searchInput.nativeElement.value.split(' ').splice(-1)[0].length);
  }

  // Put input term to hidden span and calulate width. Add margin to completion.
  setCompletionWidth() {
    const span = this.document.getElementById('completionAssist');
    span.innerHTML = this.searchInput.nativeElement.value;
    const width = span.offsetWidth;
    span.style.fontSize = 25;
    this.inputMargin = (width + 210) + 'px';
  }

  // Add completion with right arrow key if caret is at the end of term
  addCompletion() {
    const input = this.searchInput.nativeElement;
    const val = input.value;
    let isAtEnd = false;
    if (typeof input.selectionStart === 'number') {
      isAtEnd = (input.selectionEnd === val.length);
    }
    if (isAtEnd) {
      this.searchInput.nativeElement.value = this.searchInput.nativeElement.value + this.completion;
      this.queryField.setValue(this.searchInput.nativeElement.value);
      this.completion = '';
    }
  }

  // Disable up & down arrows on input. Normally places caret on start or end of input
  disableKeys(event) {
    if (event.keyCode === 40 ||  event.keyCode === 38) { return false; }
  }

  // Hide auto-suggest and reset completion if clicked outside element
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const clickedInside = this.inputGroup.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.showAutoSuggest = false;
      this.completion = '';
    }
  }

  // Set target, copy queryParams and add target to params
  changeTarget(event) {
    const target = event.value !== 'all' ? event.value : null;
    this.settingService.changeTarget(target);
    this.selectedTarget = target || null;
  }

  newInput(selectedIndex, historyLink) {
    // Copy queryparams, set target and reset page
    const newQueryParams = {...this.queryParams, target: this.selectedTarget, page: 1};
    // Reset exact field search
    this.settingService.strictFields(undefined);
    // Hide search helper
    this.showHelp = false;
    // Reset focus target
    this.tabChangeService.targetFocus('');
    // Set input to local storage & assign list to variable
    this.currentInput = this.queryField.value;
    if (this.currentInput && isPlatformBrowser(this.platformId)) {localStorage.setItem(localStorage.length.toString(), this.currentInput); }
    this.queryHistory = isPlatformBrowser(this.platformId) ? this.getHistory() : '';
    // Hide auto-suggest
    this.showAutoSuggest = false;
    // Reset completion
    this.completion = '';
    // Reset sort
    this.sortService.sortMethod = 'desc';
    // Reset page number
    this.searchService.updatePageNumber(1);
    // If query history link is clicked, send value to service and navigate
    if (historyLink) {
      this.searchService.updateInput(historyLink);
    } else {
      this.searchService.updateInput(this.searchInput.nativeElement.value);
    }
    // Reset / generate timestamp for randomized results
    this.searchService.singleInput.length > 0 ? this.filterService.timestamp = undefined : this.filterService.generateTimeStamp();

    this.searchService.getTabValues().subscribe((data: any) => {
      this.searchService.tabValues = data;
      this.searchService.redirecting = true;
      // Temporary default to publications
      // Change tab if clicked from auto suggest
      if (selectedIndex) {
        this.router.navigate(['results/', selectedIndex + 's', this.searchService.singleInput || '']);
        } else {
          // Preserve queryParams with new search to same index. Use queryParams with added target if selected
          this.router.navigate(['results/', this.tabChangeService.tab || 'publications', this.searchService.singleInput || ''],
          {queryParams: newQueryParams});
      }
    });
  }

  getHistory() {
    if (isPlatformBrowser(this.platformId)) {
      const keys = Object.keys(localStorage);
      const values = Object.values(localStorage);
      const arr = keys.map((key, i) => [key, values[i]]);
      // Filter for integer keys, sort by order, map to value and filter for duplicates
      return arr.filter(x => +x[0] === +x[0]).sort((a, b) => b[0] - a[0]).map(x => x[1]).filter((e, i, a) => a.indexOf(e) === i);
    }
  }

  addToHistory(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.showAutoSuggest = false;
      this.singleService.updateId(id);
      localStorage.setItem(localStorage.length.toString(), this.currentInput);
      this.searchService.updateInput(this.currentInput);
    }
  }

  clearHistory() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.showAutoSuggest = false;
    }
  }

  clearResponse() {
    this.topData = [];
    this.otherData = [];
  }

  onClickedOutside(e: Event) {
    this.showHelp = false;
  }
}
