import { Component, HostListener, Inject, LOCALE_ID, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchService } from '@portal/services/search.service';
import { DOCUMENT } from '@angular/common';
import { UtilityService } from '@shared/services/utility.service';
import dummyData from 'src/app/portal/components/science-politics/tki-reports/tki-dummydata.json';
import { WINDOW } from '@shared/services/window.service';
import { ResizeService } from '@shared/services/resize.service';
import { Subscription } from 'rxjs';

export interface Report {
  id: number;
  authors: string[];
  name: string[];
  link: string;
  year: string[];
  keywords: string[];
}

@Component({
  selector: 'app-tki-reports',
  templateUrl: './tki-reports.component.html',
  styleUrls: ['./tki-reports.component.scss'],
})
export class TkiReportsComponent implements OnInit {
  private showAutoSuggest: boolean;
  private queryHistory: any;
  private browserHeight: number;
  private resizeSub: Subscription;
  @Inject(DOCUMENT) private document: Document;
  @Inject(LOCALE_ID) protected localeId;
  @Inject(PLATFORM_ID) private platformId: object;

  public searchInput: any;
  public utilityService: UtilityService;
  private searchBar: any;
  private currentInput: any;
  private inputMargin: string;

  tableData: Report[] = dummyData;
  tableDataOrigin: Report[] = dummyData;

  matchedAuthors = new Set();
  matchedNames = new Set();
  matchedKeywords = new Set();
  matchedYears = new Set();
  filteredArticleIds = new Set();
  value = '';
  testiStringi = 'eskoeskoaa';
  noSearchesDone = true;
  modalOverlayVisible = false;

  constructor(private resizeService: ResizeService, @Inject(WINDOW) private window: Window) {}


  public screenWidth: number;
  public screenHeight: number;

  ngOnInit() {
  }

  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.modalOverlayVisible = false;
    }
  }

  doSearch(openSearchModal: boolean) {
    this.matchedYears.entries()
    this.modalOverlayVisible = openSearchModal;
    this.noSearchesDone = false;
    //TODO: filter the whole set here
    console.log('do search', this.value);
    const regEx = new RegExp(this.value, 'i');
    let ind = 0;
    this.matchedAuthors.clear();
    this.matchedKeywords.clear();
    this.matchedNames.clear();
    this.matchedYears.clear();
    this.filteredArticleIds.clear();
    this.tableData = [...dummyData];

    dummyData.forEach((entry: any) => {
      entry.authors.forEach((author) => {
        if (author.match(regEx)) {
          console.log('found author!');
          this.matchedAuthors.add(author);
          console.log('matched authors', this.matchedAuthors);
          this.filteredArticleIds.add(ind);
        }
      });

      entry.name.forEach((name) => {
        if (name.match(regEx)) {
          console.log('found name!');
          this.matchedNames.add([this.highlightResultKeywords(name, this.value), ind]);
          this.filteredArticleIds.add(ind);
        }
      });

      entry.keywords.forEach((kword) => {
        if (kword.match(regEx)) {
          console.log('found keyword!');
          this.matchedKeywords.add([this.highlightResultKeywords(kword, this.value), ind]);
          this.filteredArticleIds.add(ind);
        }
      });

      entry.year.forEach((year) => {
        if (year.match(regEx)) {
          console.log('found year!');
          this.matchedYears.add([this.highlightResultKeywords(year, this.value), ind]);
          this.filteredArticleIds.add(ind);
        }
      });

      ind += 1;
    });
    this.tableData = this.tableData.filter((item) => {
      //console.log('table data', this.tableData);
      //console.log('it has', this.filteredArticleIds.has(item.id));
      return this.filteredArticleIds.has(item.id);
      //console.log('filtered', this.filteredArticleIds);
    });
  }

  modalSearchClick(atricleId: number) {
    console.log('filtering', atricleId);
    this.tableData = [...dummyData];
    this.tableData = this.tableData.filter((item) => {
      return item.id === atricleId;
    });
    this.modalOverlayVisible = false;
  }

  highlightResultKeywords(wholeText: string, keyToHighlight) {
    wholeText = wholeText.replace(
      new RegExp(keyToHighlight, 'g'),
      '<strong>' + keyToHighlight + '</strong>',
    );
    console.log('wholetext 1', wholeText);
    const capitalized = keyToHighlight[0].toUpperCase() + keyToHighlight.substring(1);
    wholeText = wholeText.replace(
      new RegExp(capitalized, 'g'),
      '<strong>' + capitalized + '</strong>',
    );
    console.log('wholetext 2', wholeText);
    return wholeText;
  }

  queryField: FormControl = new FormControl();
  public searchService: SearchService;

  onFocus() {
    this.modalOverlayVisible = true;
    if (this.noSearchesDone) {
      this.value = '';
    }
  }

  modalOverlayClick() {
    this.modalOverlayVisible = false;
  }

  onKeydown(event) {}

  disableKeys(event) {}

  resetSearch() {
    this.value = '';
    this.doSearch(true);
  }

  onKeyup() {
    this.doSearch(true);
  }

  filterTableContent() {

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

  private fireAutoSuggest() {}

  private getHistory() {}


}
