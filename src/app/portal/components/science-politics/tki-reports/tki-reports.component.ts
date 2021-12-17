import {Component, Inject, LOCALE_ID, OnInit, PLATFORM_ID} from '@angular/core';
import {FormControl} from "@angular/forms";
import {SearchService} from "@portal/services/search.service";
import {DOCUMENT} from "@angular/common";
import {SettingsService} from "@portal/services/settings.service";
import {UtilityService} from "@shared/services/utility.service";

@Component({
  selector: 'app-tki-reports',
  templateUrl: './tki-reports.component.html',
  styleUrls: ['./tki-reports.component.scss']
})
export class TkiReportsComponent implements OnInit {
  private showAutoSuggest: boolean;
  private queryHistory: any;
  private browserHeight: number;

  @Inject(DOCUMENT) private document: Document;
  @Inject(LOCALE_ID) protected localeId;
  @Inject(PLATFORM_ID) private platformId: object;

  private searchInput: any;
  public utilityService: UtilityService;
  private searchBar: any;
  private currentInput: any;
  private inputMargin: string;

  constructor() { }

  queryField: FormControl = new FormControl();
  public searchService: SearchService;

  onFocus() {
    // Show auto-suggest when input in focus
    if (this.currentInput !== this.queryField.value) {
      this.fireAutoSuggest();
    }
    this.showAutoSuggest = true;
    // Hides query history if search term isn't altered after history clear button click
    this.queryHistory = this.getHistory();
    // Set queryfield value to trigger subscription and fetch suggestions
    this.queryField.setValue(this.searchInput.nativeElement.value);

    // This is used for overlay heigth calcualtion
    this.browserHeight =
      this.document.body.scrollHeight - this.searchBar.nativeElement.offsetTop;

    this.setCompletionWidth();
  }

  onKeydown(event) {
  }

  disableKeys(event) {
  }

  resetSearch(){

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

  ngOnInit(): void {
  }

  private fireAutoSuggest() {

  }

  private getHistory() {

  }
}
