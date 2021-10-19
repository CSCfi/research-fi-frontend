//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { SearchService } from 'src/app/portal/services/search.service';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WINDOW } from 'src/app/shared/services/window.service';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { news, common } from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NewsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('serviceInfoLink') serviceInfoLink: ElementRef;
  width = this.window.innerWidth;
  mobile = this.width < 992;

  private currentLocale: string;
  private metaTags = news;
  private commonTags = common;

  queryParams: any;
  selectedIndex: any;

  focusSub: Subscription;
  resizeSub: Subscription;
  routeSub: Subscription;
  queryParamSub: Subscription;

  isBrowser: boolean;
  dataFetched: any;
  dataFetched2: any;

  constructor(
    public searchService: SearchService,
    private titleService: Title,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    @Inject(WINDOW) private window: Window,
    private resizeService: ResizeService,
    public utilityService: UtilityService,
    private router: Router,
    public appSettingsService: AppSettingsService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  ngOnInit() {
    // Tab change is needed for data fetch
    this.tabChangeService.tab = 'news';

    this.searchService.updateInput('');

    // Open tab
    this.routeSub = this.route.params.pipe(take(1)).subscribe((param) => {
      this.selectedIndex = parseInt(param.tab) || 0;

      // Hide skip to input on first tab
      this.tabChangeService.toggleSkipToInput(
        this.selectedIndex === 0 ? false : true
      );
    });

    this.queryParamSub = this.route.queryParams.subscribe((queryParams) => {
      // Set query params only on filtering tab
      if (this.selectedIndex === 1) this.queryParams = queryParams;
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
      case 'sv': {
        this.setTitle(
          'De senaste vetenskaps- och forskningsnyheterna - Forskning.fi'
        );
        break;
      }
    }

    this.utilityService.addMeta(
      this.metaTags['title' + this.currentLocale],
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );

    this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
      this.onResize(dims)
    );
  }

  getQueryParams(event) {
    if (this.selectedIndex === 1) this.queryParams = event;
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.serviceInfoLink.nativeElement.focus();
        }

        if (this.selectedIndex === 0 && target === 'search-input') {
          this.selectedIndex = 1;
        }
      }
    );
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    if (isPlatformBrowser(this.platformId)) {
      this.resizeSub?.unsubscribe();
    }
    this.tabChangeService.focus = undefined;
    this.routeSub?.unsubscribe;
    this.queryParamSub?.unsubscribe;
  }

  navigate(event) {
    this.selectedIndex = event.index;
    // Hide skip to input on first tab
    this.tabChangeService.toggleSkipToInput(event.index === 0 ? false : true);

    switch (event.index) {
      case 1: {
        this.router.navigate(['news', event.index], {
          queryParams: { ...this.queryParams },
        });
        break;
      }
      default: {
        this.router.navigate(['news', event.index]);
      }
    }
  }

  onResize(event) {
    this.width = event.width;
    if (this.width >= 992) {
      this.mobile = false;
    } else {
      this.mobile = true;
    }
  }
}
