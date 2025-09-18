//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  ViewChild,
  ViewChildren,
  ElementRef,
  OnInit,
  HostListener,
  Inject,
  AfterViewInit,
  QueryList,
  PLATFORM_ID,
  ViewEncapsulation,
  LOCALE_ID,
  OnDestroy,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser, NgIf, NgFor, NgStyle, NgClass, AsyncPipe } from '@angular/common';
import { SearchService } from '@portal/services/search.service';
import { SortService } from '@portal/services/sort.service';
import { AutosuggestService } from '@portal/services/autosuggest.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SingleItemService } from '@portal/services/single-item.service';
import { ListItemComponent } from './list-item/list-item.component';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { SettingsService } from '@portal/services/settings.service';
import { UtilityService } from '@shared/services/utility.service';
import { FilterService } from '@portal/services/filters/filter.service';
import { StaticDataService } from '@portal/services/static-data.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { HighlightSearchPipe } from '../../pipes/highlight.pipe';
import { NotificationBannerComponent } from '../../../shared/components/notification-banner/notification-banner.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { MatButton } from '@angular/material/button';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        MatButton,
        MatMenuTrigger,
        NgIf,
        MatMenu,
        NgFor,
        MatMenuItem,
        ReactiveFormsModule,
        NgStyle,
        ClickOutsideDirective,
        NgClass,
        MatProgressSpinner,
        ListItemComponent,
        RouterLink,
        NotificationBannerComponent,
        AsyncPipe,
        HighlightSearchPipe,
        SvgSpritesComponent
    ]
})
export class SearchBarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchTargetMenuTrigger') searchTargetMenuTrigger: MatMenuTrigger;
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild('inputGroup', { static: true }) inputGroup: ElementRef;
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;
  input: string;
  sub: Subscription;
  autoSuggestResponse: any;
  topData: any;
  otherData: any[];
  queryField: UntypedFormControl = new UntypedFormControl();
  currentInput: any;
  autoSuggestVisible = false;
  queryHistory: any;
  showHelp = false;
  @ViewChildren(ListItemComponent) items: QueryList<any>;
  private keyManager: ActiveDescendantKeyManager<ListItemComponent>;

  docList = [
    { index: 'publication', field: 'publicationName', link: 'publicationId' },
    { index: 'funding', field: 'projectNameFi', link: 'projectId' },
    { index: 'dataset', field: 'name', link: 'identifier' },
    { index: 'infrastructure', field: 'name', link: 'name' },
    { index: 'organization', field: 'nameFi', link: 'organizationId' },
  ];

  translations = {
    publication: $localize`:@@publications:julkaisut`,
    person: $localize`:@@authors:tutkijat`,
    funding: $localize`:@@fundings:rahoitusmyönnöt`,
    dataset: $localize`:@@datasets:aineistot`,
    infrastructure: $localize`:@@infrastructures:infrastruktuurit`,
    organization: $localize`:@@organizations:tutkimusorganisaatiot`,
  };

  targets = this.staticDataService.targets;

  additionalItems = ['clear'];
  completion: string;
  inputMargin: string;
  resetMargin: string;
  isBrowser: boolean;
  currentTab: {
    data: string;
    labelFi: string;
    labelEn: string;
    link: string;
    icon: string;
  };
  selectedTab: string;
  routeSub: Subscription;
  topMargin: any;
  currentTerm: string;
  inputSub: Subscription;
  currentFocusTargetSub: Subscription;
  queryParams: any;
  selectedTarget: any;
  currentLocale: any;
  browserHeight: number;
  autoSuggestSub: Subscription;
  autoSuggestResponseSub: Subscription;
  tabSub: Subscription;
  selectedTargetLabel: any;

  constructor(
    public searchService: SearchService,
    private tabChangeService: TabChangeService,
    private route: ActivatedRoute,
    public router: Router,
    private sortService: SortService,
    private autosuggestService: AutosuggestService,
    private singleService: SingleItemService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private settingService: SettingsService,
    public utilityService: UtilityService,
    @Inject(LOCALE_ID) protected localeId,
    private filterService: FilterService,
    private staticDataService: StaticDataService,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
    this.queryHistory = this.getHistory();
    this.completion = '';
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe((params) => {
      // Targeted search
      this.selectedTarget = params.target ? params.target : null;

      if (params.target) this.getTargetLabel(params.target);
      this.queryParams = params;

      // Top margin is used to calculate overlay margin when auto suggest is open
      this.topMargin =
        this.searchBar.nativeElement.offsetHight +
        this.searchBar.nativeElement.offsetTop;
    });
    // Get previous search term and set it to form control value
    this.inputSub = this.searchService.currentInput.subscribe(
      (input) => (this.currentTerm = input)
    );
    this.queryField = new UntypedFormControl(this.currentTerm);

    // Hotfix to set docList infrastructure field with locale
    this.docList[2].field = this.docList[2].field + this.currentLocale;
  }

  ngAfterViewInit() {
    // Get items for list
    this.keyManager = new ActiveDescendantKeyManager(this.items)
      .withWrap()
      .withTypeAhead();

    this.currentFocusTargetSub =
      this.tabChangeService.currentFocusTarget.subscribe((target) => {
        if (target === 'search-input') {
          this.searchInput.nativeElement.focus();
        }
      });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.routeSub?.unsubscribe();
      this.inputSub?.unsubscribe();
      this.currentFocusTargetSub?.unsubscribe();
      this.autoSuggestSub?.unsubscribe();
      this.autoSuggestResponseSub?.unsubscribe();
      this.tabSub?.unsubscribe();
    }
  }

  inputFieldOnFocus() {
    // Show auto-suggest when input in focus
    if (this.currentInput !== this.queryField.value) {
      this.fireAutoSuggest();
    }
    this.autoSuggestVisible = true;
    // Hides query history if search term isn't altered after history clear button click
    this.queryHistory = this.getHistory();
    // Set queryfield value to trigger subscription and fetch suggestions
    this.queryField.setValue(this.searchInput.nativeElement.value);

    // This is used for overlay heigth calcualtion
    this.browserHeight =
      this.document.body.scrollHeight - this.searchBar.nativeElement.offsetTop;

    this.setCompletionWidth();
  }

  fireAutoSuggest() {                                                                                                   // TODO: Dense code warning; IS THIS DIFFERENT FROM NORMAL SEARCHES?
    this.autoSuggestSub = this.queryField.valueChanges.pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((result) => {
        this.keyManager = new ActiveDescendantKeyManager(this.items)
          .withWrap()
          .withTypeAhead();
        this.currentInput = result;

        if (result.length > 2) {
          this.topData = [];
          this.otherData = [];

          this.autoSuggestResponseSub = this.autosuggestService
            .search(result)
            .pipe(map((response) => [response]))
            .subscribe((response) => {
              // Sort indices with highest doc count
              const arr = [];
              this.autoSuggestResponse = response;
              const source = this.autoSuggestResponse[0].aggregations._index.buckets;

              Object.keys(source)
                .sort((a, b) => source[b].doc_count - source[a].doc_count)
                .forEach((key) => {
                  arr.push({                                                                                            // TODO: arr side-effect
                    index: key,
                    source: source[key],
                    translation: this.translations[key],
                  });
                });

              // Show hits for top 2 indices with most results
              this.topData = arr.slice(0, 2);
              // List other indices, filter out indices with no results
              this.otherData = arr
                .slice(2)
                .filter((x) => x.source.doc_count > 0);
              // Completion
              this.getCompletion();
            });
          // Reset data
        } else {
          this.topData = [];
          this.otherData = [];
          this.completion = '';
        }
      });
  }

  // Empty search with enter or space when close button is focused
  onKeydownCloseButton(event){
    if (event.keyCode === 13 || (event.keyCode === 32)) {
      this.resetSearch();
      this.searchInput.nativeElement.focus();
    }
  }

  toggleSearchHelpVisibility(){
    this.showHelp = !this.showHelp;
  }

  // Keycodes
  onKeydownSearchBar(event) {
    // Reset completion with else than right arrow
    if (event.keyCode !== 39) {
      this.completion = '';
    }
    this.autoSuggestVisible = true;
    if (event.keyCode === 13) {
      this.autoSuggestVisible = false;
    }

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
        this.searchService.searchTerm = term.value;
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
    } else if (event.keyCode !== 78) {
      this.keyManager.onKeydown(event);
    }
    // Hide auto-suggest with esc key
    if (event.keyCode === 27) {
      this.autoSuggestVisible = false;
    }
    // Reset completion with right arrow key
    if (event.keyCode === 39) {
      this.addCompletion();
    }
    // Reset completion
    this.completion = '';
  }

  setFocus() {
    this.tabChangeService.focusToSkipToResults(true);
  }

  getCompletion() {
    // Get first result from completions
    let completionData = this.autoSuggestResponse[0].suggest.mySuggestions[0]
      .options[0]
      ? this.autoSuggestResponse[0].suggest.mySuggestions[0].options[0].text
      : '';
    // Get second completion suggest if first is same as input
    if (completionData === this.searchInput.nativeElement.value) {
      completionData = this.autoSuggestResponse[0].suggest.mySuggestions[0]
        .options[1]
        ? this.autoSuggestResponse[0].suggest.mySuggestions[0].options[1].text
        : '';
    }
    // Replace characters other than alphabetical letters at the start of completion
    if (completionData.match(/^[^A-Z]/i)) {
      completionData = completionData.replace(/^[^A-Z]+/i, '');
    }
    this.completion = completionData.slice(
      this.searchInput.nativeElement.value.split(' ').splice(-1)[0].length
    );
  }

  // Put input term to hidden span and calulate width. Add margin to completion.
  setCompletionWidth() {
    const span = this.document.getElementById('completionAssist');
    span.innerHTML = this.searchInput.nativeElement.value;
    const width = span.offsetWidth;
    span.style.fontSize = '25px';
    const margin = 16;
    this.inputMargin = width + margin + 'px';
  }

  getResetMargin(w: number) {
    if (isPlatformBrowser(this.platformId)) {
      const margin = w < 1200 ? 30 : 50;
      const outer = this.inputGroup.nativeElement.getBoundingClientRect();
      const inner = this.searchInput.nativeElement.getBoundingClientRect();
      return inner.x - outer.x + inner.width - 30 + 'px';
    }
  }

  // Add completion with right arrow key if caret is at the end of term
  addCompletion() {
    const input = this.searchInput.nativeElement;
    const val = input.value;
    let isAtEnd = false;
    if (typeof input.selectionStart === 'number') {
      isAtEnd = input.selectionEnd === val.length;
    }
    if (isAtEnd) {
      this.searchInput.nativeElement.value =
        this.searchInput.nativeElement.value + this.completion;
      this.queryField.setValue(this.searchInput.nativeElement.value);
      this.completion = '';
    }
  }

  // Disable up & down arrows on input. Normally places caret on start or end of input
  disableKeys(event) {
    if (event.keyCode === 40 || event.keyCode === 38) {
      return false;
    }
  }

  // Hide auto-suggest and reset completion if clicked outside element
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const clickedInside = this.inputGroup.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.autoSuggestVisible = false;
      this.completion = '';
    }
  }

  // Open target menu with enter key
  openTargetMenu() {
    this.searchTargetMenuTrigger.openMenu();
  }

  // Set target, copy queryParams and add target to params
  changeTarget(selection) {
    const target = selection.value !== 'all' ? selection.value : null;
    this.settingService.changeTarget(target);
    this.selectedTarget = target || null;
    this.getTargetLabel(selection.value);
  }

  getTargetLabel(target) {
    const match = this.targets.find((item) => item.value === target);
    this.selectedTargetLabel = match
      ? match['viewValue' + this.currentLocale]
      : this.targets[0]['viewValue' + this.currentLocale];
  }

  resetSearch() {
    this.searchInput.nativeElement.value = '';
    this.selectedTarget = '';
    // Navigate only if search term already in use
    if (this.searchService.searchTerm.length > 0) {
      this.newInput(false, false);
    }
  }

  newInput(selectedIndex, historyLink) {
    // Check that current target exists in predefined list, reset if not
    this.selectedTarget = this.targets.find(
      (item) => item.value === this.selectedTarget
    )
      ? this.selectedTarget
      : '';
    // Copy queryparams, set target and reset page
    const newQueryParams = {
      ...this.queryParams,
      target: this.selectedTarget,
      page: 1,
    };
    // Hide search helper
    this.showHelp = false;
    // Reset focus target
    this.tabChangeService.targetFocus('');
    // Set input to local storage & assign list to variable
    this.currentInput = this.queryField.value;
    if (this.currentInput && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(localStorage.length.toString(), this.currentInput);
    }
    this.queryHistory = isPlatformBrowser(this.platformId)
      ? this.getHistory()
      : '';
    // Hide auto-suggest
    this.autoSuggestVisible = false;
    // Reset completion
    this.completion = '';
    // Reset sort
    this.sortService.sortMethod = 'desc';
    // Reset page number
    this.searchService.updatePageNumber(1, this.searchService.pageSize);
    // If query history link is clicked, send value to service and navigate
    if (historyLink) {
      this.searchService.updateInput(historyLink);
    } else {
      this.searchService.updateInput(this.searchInput.nativeElement.value);
    }
    // Reset / generate timestamp for randomized results
    this.searchService.searchTerm.length > 0
      ? (this.filterService.timestamp = undefined)
      : this.filterService.generateTimeStamp();

    this.tabSub = this.searchService.getTabValues().subscribe((data: any) => {
      this.searchService.tabValues = data;
      this.searchService.redirecting = true;
      // Temporary default to publications
      // Change tab if clicked from auto suggest
      if (selectedIndex) {
        this.router.navigate([
          'results/',
          selectedIndex + 's',
          this.searchService.searchTerm || '',
        ]);
      } else {
        // Preserve queryParams with new search to same index. Use queryParams with added target if selected
        this.router.navigate(
          [
            'results/',
            this.tabChangeService.tab || 'publications',
            this.searchService.searchTerm || '',
          ],
          { queryParams: newQueryParams }
        );
      }
    });
  }

  getHistory() {
    if (isPlatformBrowser(this.platformId)) {
      const keys = Object.keys(localStorage);
      const values = Object.values(localStorage);
      const arr = keys.map((key, i) => [key, values[i]]);
      // Filter for integer keys, sort by order, map to value and filter for duplicates
      return arr
        .filter((x) => +x[0] === +x[0])
        .sort((a, b) => b[0] - a[0])
        .map((x) => x[1])
        .filter((e, i, a) => a.indexOf(e) === i);
    }
  }

  addToHistory(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.autoSuggestVisible = false;
      this.singleService.updateId(id);
      localStorage.setItem(localStorage.length.toString(), this.currentInput);
      this.searchService.updateInput(this.currentInput);
    }
  }

  clearHistory() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.autoSuggestVisible = false;
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
