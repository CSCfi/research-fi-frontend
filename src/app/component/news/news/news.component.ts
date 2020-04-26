//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, LOCALE_ID, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/internal/operators/map';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { FilterService } from 'src/app/services/filter.service';
import { SortService } from 'src/app/services/sort.service';
import { WINDOW } from 'src/app/services/window.service';
import { ResizeService } from 'src/app/services/resize.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, AfterViewInit, OnDestroy {
  data: any;
  errorMessage: any;
  focusSub: any;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  width = this.window.innerWidth;
  mobile = this.width < 992;
  isBrowser: any;
  filterValues: unknown;
  filters: any;
  modalRef: BsModalRef;
  resizeSub: any;
  paramSub: any;

  constructor( private searchService: SearchService, private titleService: Title, @Inject(LOCALE_ID) protected localeId: string,
               private tabChangeService: TabChangeService, @Inject(PLATFORM_ID) private platformId: object,
               private dataService: DataService, private route: ActivatedRoute, private filterService: FilterService,
               private sortService: SortService, @Inject(WINDOW) private window: Window, private resizeService: ResizeService) {
                this.isBrowser = isPlatformBrowser(this.platformId);
                }

  ngOnInit() {
    this.getFilterData();
    this.paramSub = this.route.queryParams.subscribe(query => {
      this.sortService.updateTab('news');

      // Check for Angular Univeral SSR, get filters if browser
      if (isPlatformBrowser(this.platformId)) {
        this.filters = {
          // Global
          year: [query.year].flat().filter(x => x).sort(),
          fromYear: [query.fromYear].flat().filter(x => x).sort(),
          toYear: [query.toYear].flat().filter(x => x).sort(),
          field: [query.field].flat().filter(x => x).sort(),
          // Publications
          sector: [query.sector].flat().filter(x => x).sort(),
          organization: [query.organization].flat().filter(x => x).sort(),
          publicationType: [query.publicationType].flat().filter(x => x).sort(),
          countryCode: [query.countryCode].flat().filter(x => x).sort(),
          lang: [query.lang].flat().filter(x => x).sort(),
          juFo: [query.juFo].flat().filter(x => x).sort(),
          openAccess: [query.openAccess].flat().filter(x => x).sort(),
          internationalCollaboration: [query.internationalCollaboration].flat().filter(x => x).sort(),
          // Fundings
          funder: [query.funder].flat().filter(x => x).sort(),
          typeOfFunding: [query.typeOfFunding].flat().filter(x => x).sort(),
          scheme: [query.scheme].flat().filter(x => x).sort(),
          fundingStatus: [query.fundingStatus].flat().filter(x => x).sort(),
          fundingAmount: [query.fundingAmount].flat().filter(x => x).sort(),
          faField: [query.faField].flat().filter(x => x).sort(),
          // Infrastructures
          type: [query.type].flat().filter(x => x).sort(),
        };
      }

      // Check for Angular Univeral SSR, update filters if browser
      if (isPlatformBrowser(this.platformId)) {this.filterService.updateFilters(this.filters); }

      // Get data
      this.getNews();
    });

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
    }

    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'search-input') {
        this.searchInput.nativeElement.focus();
      }
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
  }


  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  getNews() {
    this.searchService.getNews(100)
    .subscribe(data => {
      this.data = data;
      // console.log(this.data);
    }, error => this.errorMessage = error as any);
  }

  getFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.searchService.getNewsFilters()
      .pipe(map(data => [data]))
      .subscribe(filterValues => {
        this.filterValues = filterValues;
        // Send response to data service
        this.dataService.changeResponse(this.filterValues);
      },
        error => this.errorMessage = error as any);
    }
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    if (isPlatformBrowser(this.platformId)) {
      this.resizeSub.unsubscribe();
      this.paramSub.unsubscribe();
    }
  }

  closeModal() {
    this.modalRef.hide();
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
