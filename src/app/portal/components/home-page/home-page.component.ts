//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  ElementRef,
  Inject,
  QueryList,
  AfterViewInit,
  ChangeDetectorRef,
  LOCALE_ID,
  OnDestroy,
} from '@angular/core';
import { DOCUMENT, NgFor, NgIf, NgStyle } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { TabChangeService } from '@portal/services/tab-change.service';
import { ResizeService } from '@shared/services/resize.service';
import { Subscription } from 'rxjs';
import { News } from '@portal/models/news.model';
import { Shortcut } from '@portal/models/shortcut.model';
import { UtilityService } from '@shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Search } from '@portal/models/search.model';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { ReviewComponent } from '../../../shared/components/review/review.component';
import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { NewsCardComponent } from '../news/news-card/news-card.component';
import { TabNavigationComponent } from '../tab-navigation/tab-navigation.component';

@Component({
    providers: [SearchBarComponent],
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
    standalone: true,
    imports: [
        SearchBarComponent,
        TabNavigationComponent,
        NgFor,
        NgIf,
        RouterLink,
        NewsCardComponent,
        DividerComponent,
        NgStyle,
        ReviewComponent,
        DialogComponent,
        SafeUrlPipe,
    ],
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  allData: any[];
  errorMessage = [];
  status = false;
  news: News[] = [];
  resultData: Search;
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChildren('shortcutItem') shortcutItem: QueryList<ElementRef>;
  @ViewChild('main') mainContent: ElementRef;
  basicStyle = {
    border: '0px',
    background: 'white',
    margin: '6px 0 6px',
    minWidth: '180px',
  };
  maxHeight: number;

  resizeSub: Subscription;
  newsSub: Subscription;
  fundingCallsSub: Subscription;
  allResultCountSub: Subscription;

  private metaTags = MetaTags.homepage;
  private commonTags = MetaTags.common;

  newsImage = {
    link: '/news',
    alt: ' ',
    imgPath: 'assets/img/home/news.jpeg',
  };

  focusSub: any;
  currentLocale: string;
  showDialog: boolean;
  shortcutData: Shortcut[] = [];

  constructor(
    private searchService: SearchService,
    private sortService: SortService,
    @Inject(DOCUMENT) private document: any,
    private cdr: ChangeDetectorRef,
    @Inject(LOCALE_ID) public localeId: string,
    private tabChangeService: TabChangeService,
    private resizeService: ResizeService,
    public utilityService: UtilityService,
    private route: ActivatedRoute,
    private appSettingsService: AppSettingsService,
    private router: Router,
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit() {
    this.utilityService.addMeta(
      this.metaTags['title' + this.currentLocale],
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );
    // Reset search term
    this.searchService.updateInput('');

    // Get data for count-ups
    this.getAllData();

    // Get news data
    this.newsSub = this.searchService.getNews(10).subscribe((data) => {
      this.news = data;
    });

    // Get funding calls data
    this.fundingCallsSub = this.searchService
      .getHomepageFundingCalls(10)
      .subscribe((data) => {
        this.resultData = data;
      });

    // Reset sort
    this.sortService.updateSort('');

    // Set title
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Etusivu - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Home - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Ingångssida - Forskning.fi');
        break;
      }
    }
    this.srHeader.nativeElement.innerHTML = this.document.title.split(' - ', 1);

    this.resizeSub = this.resizeService.onResize$.subscribe((_) =>
      this.onResize()
    );

    // Get shortcuts from Resolver
    this.shortcutData = this.route.snapshot.data.shortcuts;
    this.shortcutData.map(item => {
      item.isExternalLink = item.link.startsWith('http');
    });
  }

  onResize() {
    // Timeout needs to be added because shortcutItem list doesn't keep up with resize
    setTimeout(() => {
      this.getHeight();
    }, 200);
  }

  ngAfterViewInit() {
    this.getHeight();
    // Focus first element when clicked with skip-link
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.mainContent?.nativeElement.focus();
          this.tabChangeService.targetFocus(null);
        }
      }
    );
    // if (isPlatformBrowser(this.platformId)) {
    //   (this.window as any).twttr?.widgets?.load();
    // }
  }

  // Get height of div with most height
  getHeight() {
    const heightArr = [];
    this.shortcutItem.forEach((item) => {
      heightArr.push(item.nativeElement.firstElementChild.offsetHeight);
    });
    this.maxHeight = Math.max(...heightArr) + 30;

    this.cdr.detectChanges();
  }

  getAllData() {
    this.allResultCountSub = this.searchService
      .getAllResultCount()
      .pipe(map((allData) => [allData]))
      .subscribe({
        next: (allData) => (this.allData = allData),
        error: (error) => (this.errorMessage = error as any),
      });
  }

  toggleReview() {
    this.showDialog = !this.showDialog;
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
    this.newsSub?.unsubscribe();
    this.fundingCallsSub?.unsubscribe();
    this.allResultCountSub?.unsubscribe();
  }
}
