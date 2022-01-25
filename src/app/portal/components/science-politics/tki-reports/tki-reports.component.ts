import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import dummyData from 'src/app/portal/components/science-politics/tki-reports/tki-dummydata.json';
import { DOCUMENT } from '@angular/common';
import { UtilityService } from '@shared/services/utility.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ListItemComponent } from '@portal/components/search-bar/list-item/list-item.component';
import { Title } from '@angular/platform-browser';

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

  filteredSourceData: Report[] = this.replaceEmptyKeywordsWithDash(dummyData);
  resultDataMobile: Report[] = this.replaceEmptyKeywordsWithDash(dummyData);
  formattedTableData = new MatTableDataSource(this.replaceEmptyKeywordsWithDash(this.filteredSourceData));

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
    private appSettingsService: AppSettingsService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.isMobileSubscription = this.appSettingsService.mobileStatus.subscribe((status) => {
      this.isMobile = status;
    });
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Selvityksiä ja raportteja - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Studies and reports - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Utredningar och rapporter - Forskning.fi');
        break;
      }
    }
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
      this.closeModal();
    }
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  doFiltering(keepModalOpen: boolean) {
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
        if (kword.match(regEx) && this.value !== '-') {
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
      this.closeModal();
      this.formattedTableData.data = [...this.filteredSourceData];
      this.resultDataMobile = [...this.filteredSourceData];
      this.search.nativeElement.blur();
    }
  }

  replaceEmptyKeywordsWithDash(sourceData: Report[]) {
    sourceData = sourceData.map(report => {
      report.keywords = report.keywords.map(keyword => {
        if (keyword === '') {
          keyword = '-';
        }
        return keyword;
      });
      return report;
    });
    return sourceData;
  }

  modalSearchRowClick(atricleId: number) {
    this.filteredSourceData = [...dummyData];
    this.filteredSourceData = this.filteredSourceData.filter((item) => {
      return item.id === atricleId;
    });
    this.resultDataMobile = [...this.replaceEmptyKeywordsWithDash(this.filteredSourceData)];
    this.formattedTableData.data = [...this.replaceEmptyKeywordsWithDash(this.filteredSourceData)];
    this.closeModal();
    this.search.nativeElement.blur();
  }

  onFocus() {
    this.modalOverlayVisible = true;
    if (this.noSearchesDone) {
      this.value = '';
    }
    this.modalOverlayHeight = this.document.body.scrollHeight - this.HEADER_HEIGHT;
  }

  closeModal() {
    this.modalOverlayVisible = false;
    this.keyManager.setActiveItem(-1);
  }

  modalOverlayClick() {
    this.closeModal();
  }

  resetSearch() {
    this.value = '';
    this.doFiltering(false);
  }

  // Keycodes
  onKeyup(event) {
    // Handle arrows
    if (event.keyCode === 38) {
    } else if (event.keyCode === 40) {
    } else if (event.keyCode === 13 && this.keyManager.activeItem) {
      // Do search with enter when an item is selected
      this.modalSearchRowClick(this.keyManager.activeItem.id);
    } else if (event.keyCode === 13 && !this.keyManager.activeItem) {
      /// Do default search with enter when no items are selected
      this.doFiltering(false);
    } else {
      this.doFiltering(true);
    }
    // Hide auto-suggest with esc key
    if (event.keyCode === 27) {
      this.modalOverlayVisible = false;
    } else if (event.keyCode !== 78) {
      this.keyManager.onKeydown(event);
    }
  }

  // Disable up & down arrows on input. Normally moves caret on start or end of input
  disableKeys(event) {
    if (event.keyCode === 40 || event.keyCode === 38) {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.isMobileSubscription.unsubscribe();
  }
}
