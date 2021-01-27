//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewChild, ViewChildren, ElementRef, Inject, PLATFORM_ID, QueryList, AfterViewInit,
         ChangeDetectorRef, LOCALE_ID, OnDestroy } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title, } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';
import { News } from 'src/app/models/news.model';
import { Shortcut } from 'src/app/models/shortcut.model';
import { UtilityService } from 'src/app/services/utility.service';
import { homepage, common } from 'src/assets/static-data/meta-tags.json';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReviewComponent } from 'src/app/ui/review/review.component';
import { PrivacyService } from 'src/app/services/privacy.service';
import { WINDOW } from 'src/app/services/window.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  providers: [SearchBarComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  allData: any [];
  errorMessage = [];
  status = false;
  news: News[] = [];
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

  private metaTags = homepage;
  private commonTags = common;

  newsImage = {
    link: '/news',
    alt: ' ',
    imgPath: 'assets/img/home/news.jpeg'
  };

  focusSub: any;
  currentLocale: string;
  reviewDialogRef: MatDialogRef<ReviewComponent>;
  consentStatus: string;
  consentStatusSub: any;
  shortcutData: Shortcut[] = [];

  constructor( private searchService: SearchService, private sortService: SortService, @Inject(WINDOW) private window: Window,
               private titleService: Title, @Inject(DOCUMENT) private document: any, @Inject(PLATFORM_ID) private platformId: object,
               private cdr: ChangeDetectorRef, @Inject(LOCALE_ID) public localeId: string, private tabChangeService: TabChangeService,
               private resizeService: ResizeService, public utilityService: UtilityService, private route: ActivatedRoute,
               public dialog: MatDialog, private privacyService: PrivacyService) {
                 // Capitalize first letter of locale
                this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
               }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit() {
    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
                                this.metaTags['description' + this.currentLocale],
                                this.commonTags['imgAlt' + this.currentLocale]);
    // Reset search term
    this.searchService.updateInput('');

    // Get data for count-ups
    this.getAllData();

    // Get news data
    this.searchService.getNews(10).subscribe(data => {
      this.news = data;
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

    this.resizeSub = this.resizeService.onResize$.subscribe(_ => this.onResize());

    // Get consent status
    if (isPlatformBrowser(this.platformId)) {
      this.consentStatusSub = this.privacyService.currentConsentStatus.subscribe(status => {
        this.consentStatus = localStorage.getItem('cookieConsent') ? localStorage.getItem('cookieConsent') : status;
      });
    }

    // Get shortcuts from Resolver
    this.shortcutData = this.route.snapshot.data.shortcuts;
  }

  onResize() {
    // Timeout needs to be added because shortcutItem list doesn't keep up with resize
    setTimeout(x => {
      this.getHeight();
    }, 200);
  }

  ngAfterViewInit() {
    this.getHeight();
    // Focus first element when clicked with skip-link
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainContent?.nativeElement.focus();
        this.tabChangeService.targetFocus(null);
      }
    });
    if (isPlatformBrowser(this.platformId)) {
      (this.window as any).twttr?.widgets?.load();
    }
  }

  // Get height of div with most height
  getHeight() {
    const heightArr = [];
    this.shortcutItem.forEach(item => {
      heightArr.push(item.nativeElement.firstElementChild.offsetHeight);
    });
    this.maxHeight = Math.max(...heightArr) + 30;

    this.cdr.detectChanges();
  }

  getAllData() {
    this.searchService.getAllResultCount()
    .pipe(map(allData => [allData]))
    .subscribe(allData => this.allData = allData,
      error => this.errorMessage = error as any);
  }

  toggleReview() {
    this.reviewDialogRef = this.dialog.open(ReviewComponent, {
      maxWidth: '800px',
      minWidth: '320px',
      // minHeight: '60vh'
    });
  }


  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
    this.consentStatusSub?.unsubscribe();
  }
}
