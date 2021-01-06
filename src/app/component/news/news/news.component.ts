//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, LOCALE_ID, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, ViewChildren,
         QueryList, ViewEncapsulation } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/internal/operators/map';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from 'src/app/services/filters/filter.service';
import { SortService } from 'src/app/services/sort.service';
import { WINDOW } from 'src/app/services/window.service';
import { ResizeService } from 'src/app/services/resize.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { NewsCardComponent } from '../news-card/news-card.component';
import { news, common } from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/services/utility.service';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewsComponent implements OnInit, AfterViewInit, OnDestroy {
  data: any;
  dataCopy: any;
  errorMessage: any;
  focusSub: any;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('older') olderHeader: ElementRef;
  @ViewChildren(NewsCardComponent, {read: ElementRef }) cards: QueryList<ElementRef>;
  width = this.window.innerWidth;
  mobile = this.width < 992;
  isBrowser: any;
  filterValues: unknown;
  filters: any;
  modalRef: BsModalRef;
  resizeSub: any;
  paramSub: any;
  olderData: any;
  queryField: FormControl = new FormControl();

  private currentLocale: string;
  private metaTags = news;
  private commonTags = common;
  inputSub: any;
  currentTerm: string;
  queryParams: any;

  constructor( public searchService: SearchService, private titleService: Title, @Inject(LOCALE_ID) protected localeId: string,
               private tabChangeService: TabChangeService, @Inject(PLATFORM_ID) private platformId: object,
               private dataService: DataService, private route: ActivatedRoute, private filterService: FilterService,
               private sortService: SortService, @Inject(WINDOW) private window: Window, private resizeService: ResizeService,
               public utilityService: UtilityService, private router: Router) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);

  }

  ngOnInit() {
    // Tab change is needed for filters
    this.tabChangeService.tab = 'news';

    this.paramSub = this.route.queryParams.subscribe(query => {
      // Get query params and send search term to service
      this.queryParams = query;
      if (query.search) {
        this.searchService.updateInput(query.search);
      } else {
        this.searchService.updateInput('');
      }
      // Update sort
      this.sortService.updateTab('news');
      // Scroll to older news header with pagination, TODO: Do without timeout
      if (this.tabChangeService.focus === 'olderNews' && this.mobile) {
        setTimeout(x => this.olderHeader.nativeElement?.scrollIntoView(), 1);
        }

      this.searchService.updateNewsPageNumber(parseInt(query.page, 10));
      // Check for Angular Univeral SSR, get filters if browser
      if (isPlatformBrowser(this.platformId)) {
        this.filters = this.filterService.filterList(query);
      }

      // Check for Angular Univeral SSR, update filters if browser
      if (isPlatformBrowser(this.platformId)) {this.filterService.updateFilters(this.filters); }

      // Get data
      this.getNews();
      this.getOlderNews();
      this.getFilterData();
    });

    this.inputSub = this.searchService.currentInput.subscribe(input => this.currentTerm = input);
    this.queryField = new FormControl(this.currentTerm);

    // Set title
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tiede- ja tutkimusuutiset - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Science and research news - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('De senaste vetenskaps- och forskningsnyheterna - Forskning.fi');
        break;
      }
    }

    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
                                this.metaTags['description' + this.currentLocale],
                                this.commonTags['imgAlt' + this.currentLocale]);


    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'search-input') {
        this.searchInput.nativeElement.focus();
      }
      if (target === 'main-link') {
        this.cards.first.nativeElement.focus();
      }
    });
  }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  getNews() {
    this.searchService.getNews(5)
    .subscribe(data => {
      this.data = data;
      this.dataCopy = data;
    }, error => this.errorMessage = error as any);
  }

  getOlderNews() {
    this.searchService.getOlderNews()
    .subscribe(data => {
      this.olderData = data;
    }, error => this.errorMessage = error as any);
  }

  getFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.searchService.getNewsFilters()
      .subscribe(filterValues => {
        this.filterValues = filterValues;
        // Send response to data service
        this.dataService.changeResponse(this.filterValues);
      },
        error => this.errorMessage = error as any);
    }
  }

  searchNews() {
    const searchTerm = this.searchInput.nativeElement.value;
    this.searchService.updateInput(searchTerm);
    const params = Object.assign({}, this.queryParams);
    params.search = searchTerm;
    this.router.navigate([], {queryParams: params});
    this.getNews();
    this.getFilterData();
  }

  resetSearch() {
    this.queryField.reset();
    this.searchInput.nativeElement.value = '';
    this.currentTerm = '';
    this.searchService.updateInput('');
    const params = Object.assign({}, this.queryParams);
    params.search = null;
    this.router.navigate([], {queryParams: params});
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    if (isPlatformBrowser(this.platformId)) {
      this.resizeSub?.unsubscribe();
      this.paramSub?.unsubscribe();
    }
    this.searchService.updateNewsPageNumber(1);
    this.tabChangeService.focus = undefined;
    this.searchService.updateInput('');
    if (this.filters) {
      this.filters.organization = [];
      this.filterService.updateFilters(this.filters);
    }
  }

  closeModal() {
    this.modalRef.hide();
  }

  toggleData() {
    this.data.length > 0 ? this.data = [] : this.data = this.dataCopy;
  }

  onResize(event) {
    this.width = event.width;
    if (this.width >= 992) {
      this.mobile = false;
      // Modal existence check
      // tslint:disable-next-line: no-unused-expression
      this.modalRef && this.closeModal();
    } else {
      this.mobile = true;
    }
  }

}
