import {
  AfterViewInit,
  Component, ElementRef,
  HostListener,
  Inject,
  LOCALE_ID, OnDestroy,
  OnInit,
  PLATFORM_ID, QueryList,
  ViewChild, ViewChildren
} from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import dummyData from 'src/app/portal/components/science-politics/tki-reports/tki-dummydata.json';
import { DOCUMENT } from '@angular/common';
import { UtilityService } from '@shared/services/utility.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { ActiveDescendantKeyManager, InteractivityChecker } from '@angular/cdk/a11y';
import { ListItemComponent } from '@portal/components/search-bar/list-item/list-item.component';
import { _isNumberValue } from '@angular/cdk/coercion';
import { arc } from 'd3-shape';

export interface Report {
  id: number;
  authors: string[];
  name: string[];
  link: string;
  year: string;
  keywords: string[];
}

@Component({
  selector: 'app-tki-reports',
  templateUrl: './tki-reports.component.html',
  styleUrls: ['./tki-reports.component.scss']
})
export class TkiReportsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('searchInput') search: ElementRef;
  @ViewChildren(ListItemComponent) items: QueryList<any>;

  public utilityService: UtilityService;
  private isMobileSubscription: Subscription;
  private keyManager: ActiveDescendantKeyManager<ListItemComponent>;

  filteredSourceData: Report[] = dummyData;
  resultDataMobile: Report[] = dummyData;
  formattedTableData = new MatTableDataSource(this.filteredSourceData);

  displayedColumns = ['name', 'year', 'authors', 'keywords'];
  value = '';
  noSearchesDone = true;
  modalOverlayVisible = false;
  modalOverlayHeight: number;
  HEADER_HEIGHT = 88;
  isMobile = false;

  matchedAuthors = new Set();
  matchedNames = new Set();
  matchedKeywords = new Set();
  matchedYears = new Set();
  filteredArticleIds = new Set();
  faSearch = faSearch;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) protected localeId,
    @Inject(PLATFORM_ID) private platformId: object,
    private appSettingsService: AppSettingsService,
    private interactivityChecker: InteractivityChecker
  ) {
  }

  ngOnInit() {
    this.isMobileSubscription = this.appSettingsService.mobileStatus.subscribe((status) => {
      this.isMobile = status;
    });
    //TODO: fetch data from back end here
  }

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.formattedTableData.sort = this.sort;
    this.keyManager = new ActiveDescendantKeyManager(this.items).withWrap().withTypeAhead();
    this.keyManager.setFirstItemActive();
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvents(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.modalOverlayVisible = false;
    }
  }

  doFiltering(keepModalOpen: boolean) {
    this.modalOverlayVisible = keepModalOpen;
    this.noSearchesDone = false;
    const regEx = new RegExp(this.value, 'i');
    let ind = 0;
    this.matchedAuthors.clear();
    this.matchedKeywords.clear();
    this.matchedNames.clear();
    this.matchedYears.clear();
    this.filteredArticleIds.clear();
    this.filteredSourceData = [...dummyData];

    dummyData.forEach((entry: any) => {
      entry.authors.forEach((author) => {
        if (author.match(regEx)) {
          this.matchedAuthors.add([author, dummyData[ind].id]);
          this.filteredArticleIds.add(dummyData[ind].id);
        }
      });

      entry.name.forEach((name) => {
        if (name.match(regEx)) {
          this.matchedNames.add([name, dummyData[ind].id]);
          this.filteredArticleIds.add(dummyData[ind].id);
        }
      });

      entry.keywords.forEach((kword) => {
        if (kword.match(regEx)) {
          this.matchedKeywords.add([kword, dummyData[ind].id]);
          this.filteredArticleIds.add(dummyData[ind].id);
        }
      });

      if (entry.year.match(regEx)) {
        this.matchedYears.add([entry.year, dummyData[ind].id]);
        this.filteredArticleIds.add(dummyData[ind].id);
      }

      ind += 1;
    });
    this.filteredSourceData = this.filteredSourceData.filter((item) => {
      return this.filteredArticleIds.has(item.id);
    });

    // This is called when search button is pressed. Table data is filtered only after modal is closed.
    if (!keepModalOpen) {
      this.formattedTableData.data = this.filteredSourceData;
      this.resultDataMobile = [...this.filteredSourceData];
      this.search.nativeElement.blur();
    }
  }

  modalSearchRowClick(articleId: number) {
    console.log('search row click', articleId);
    this.filteredSourceData = [...dummyData];
    this.filteredSourceData = this.filteredSourceData.filter((item) => {
      return item.id === articleId;
    });
    this.resultDataMobile = [...this.filteredSourceData];
    this.formattedTableData.data = this.filteredSourceData;
    this.modalOverlayVisible = false;
    this.keyManager.setFirstItemActive();
    //this.keyManager.setActiveItem(2);
  }

  onFocus() {
    this.modalOverlayVisible = true;
    if (this.noSearchesDone) {
      this.value = '';
    }
    this.modalOverlayHeight = this.document.body.scrollHeight - this.HEADER_HEIGHT;
  }

  modalOverlayClick() {
    this.modalOverlayVisible = false;
  }

  resetSearch() {
    this.value = '';
    this.doFiltering(false);
  }

  // Keycodes
  onKeydown(event) {
    if (event.keyCode !== 78) {
      this.keyManager.onKeydown(event);
    }
    switch (event) {
      // Disable up & down arrows on input. Normally moves caret on start or end of input
      case event.keyCode === 40 || event.keyCode === 38:
        this.modalOverlayVisible = false;
        break;
      // Hide modal with esc key
      case event.keyCode === 27:
        this.modalOverlayVisible = false;
        break;
      // Handle enter
      case event.keyCode === 13:
        if (this.keyManager.activeItem) {
          console.log('active', this.keyManager.activeItem);
          this.modalSearchRowClick(this.keyManager.activeItem.id);
        } else {
          // Press search button as default action when nothing selected and close modal
          this.doFiltering(false);
        }
        break;
      // Close modal with right arrow when item is selected
      case this.modalOverlayVisible === true && this.keyManager.activeItem && event.keyCode === 39:
        break;
      default:
        this.doFiltering(true);
    }
  }

  // Disable up & down arrows on input. Normally places caret on start or end of input
  disableKeys(event) {
    if (event.keyCode === 40 || event.keyCode === 38) {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.isMobileSubscription.unsubscribe();
  }
}
