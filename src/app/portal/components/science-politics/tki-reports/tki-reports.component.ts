import {
  AfterViewInit,
  Component, ElementRef,
  HostListener,
  Inject,
  LOCALE_ID, OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import dummyData from 'src/app/portal/components/science-politics/tki-reports/tki-dummydata.json';
import { DOCUMENT } from '@angular/common';
import { UtilityService } from '@shared/services/utility.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';

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
  styleUrls: ['./tki-reports.component.scss'],
})
export class TkiReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Inject(DOCUMENT) private document: Document;
  @Inject(LOCALE_ID) protected localeId;
  @Inject(PLATFORM_ID) private platformId: object;
  @ViewChild('searchInput') search: ElementRef;

  public utilityService: UtilityService;
  private isMobileSubscription: Subscription;
  filteredSourceData: Report[] = dummyData;
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

  constructor(private appSettingsService: AppSettingsService) {}

  ngOnInit() {
    this.isMobileSubscription = this.appSettingsService.mobileStatus.subscribe((status) => {
      this.isMobile = status;
    });
    //TODO: fetch data from back end here
  }

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.formattedTableData.sort = this.sort;
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvents(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.modalOverlayVisible = false;
    }
  }

  doFiltering(openSearchModal: boolean) {
    this.modalOverlayVisible = openSearchModal;
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
    if (!openSearchModal) {
      this.formattedTableData.data = this.filteredSourceData;
      this.search.nativeElement.blur();
    }
  }

  modalSearchRowClick(atricleId: number) {
    this.filteredSourceData = [...dummyData];
    this.filteredSourceData = this.filteredSourceData.filter((item) => {
      return item.id === atricleId;
    });
    this.formattedTableData.data = this.filteredSourceData;
    this.modalOverlayVisible = false;
  }

  onFocus() {
    this.modalOverlayVisible = true;
    if (this.noSearchesDone) {
      this.value = '';
    }
    this.modalOverlayHeight = this.document?.body.scrollHeight - this.HEADER_HEIGHT;
  }

  modalOverlayClick() {
    this.modalOverlayVisible = false;
  }

  resetSearch() {
    this.value = '';
    this.doFiltering(false);
  }

  onKeyup() {
    this.doFiltering(true);
  }

  ngOnDestroy(): void {
    this.isMobileSubscription.unsubscribe();
  }
}
