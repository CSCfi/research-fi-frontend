// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ElementRef, AfterViewInit, ChangeDetectorRef, Inject, LOCALE_ID, OnDestroy,
         ViewChildren, QueryList, HostListener, ViewEncapsulation, ViewChild, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription, combineLatest } from 'rxjs';
import { mergeMap, filter, catchError, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { WINDOW } from 'src/app/services/window.service';
import { content } from '../../../../../assets/static-data/figures-content.json';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { UtilityService } from 'src/app/services/utility.service';
import { singleFigure, common } from 'src/assets/static-data/meta-tags.json';
import { cloneDeep } from 'lodash';
import { ContentDataService } from 'src/app/services/content-data.service';
import { Figure } from 'src/app/models/figure/figure.model';

@Component({
  selector: 'app-single-figure',
  templateUrl: './single-figure.component.html',
  styleUrls: ['./single-figure.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SingleFigureComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('content') content: QueryList<ElementRef>;
  @ViewChild('keyboardHelp') keyboardHelp: ElementRef;

  dataContent: {
    id: string;
    headerFi: string;
    headerEn: string;
    headerSv: string;
    items: {
        labelFi: string;
        labelEn: string;
        labelSv: string;
        descriptionFi: string;
        descriptionEn: string;
        descriptionSv: string;
        img: string;
        iframeFi: string;
        iframeEn: string;
        iframeSv: string;
        link: string;
        sourceFi: string;
        sourceEn: string;
        sourceSv: string;
        infoFi?: string;
        infoEn?: string;
        infoSv?: string;
        segment?: string;
        roadmap?: boolean;
    }[]}[] = content;
  flatData: any[] = [];

  colWidth: number;
  faQuestion = faQuestionCircle;
  resizeSub: Subscription;
  dataSub: any;
  allContent: any;
  combinedData: any;
  routeSub: Subscription;
  currentParent: any;
  currentItem: any;
  result: any;
  contentSub: Subscription;
  title: any;
  mobile = this.window.innerWidth < 992;
  height = this.window.innerHeight;
  width = this.window.innerWidth;
  showInfo = false;
  showHelp = false;
  currentLocale: string;
  private metaTags = singleFigure;
  private commonTags = common;
  queryParamSub: Subscription;
  queryParams: any;
  filter: any;
  figureData: Figure[] = [];
  loading = true;

  constructor( private cdr: ChangeDetectorRef, private titleService: Title, @Inject( LOCALE_ID ) protected localeId: string,
               private resizeService: ResizeService, private route: ActivatedRoute, private cds: ContentDataService,
               @Inject(WINDOW) private window: Window, private tabChangeService: TabChangeService,
               private utilityService: UtilityService, @Inject(PLATFORM_ID) private platformId: object) {
                  // Capitalize first letter of locale
                  this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
                }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit(): void {
    this.routeSub = combineLatest([this.route.params, this.route.queryParams])
    .pipe(map(res => ({params: res[0], queryParams: res[1]})))
    .subscribe(res => {
      this.currentParent = res.params.id.slice(0, 2);
      this.currentItem = res.params.id;

      // Call API only if no data in session storage
      if (isPlatformBrowser(this.platformId)) {
        if (!sessionStorage.getItem('figureData')) {
          this.cds.getFigures().subscribe(data => {
            this.figureData = data;
            sessionStorage.setItem('figureData', JSON.stringify(data));
            this.setContent(res);
          });
        } else {
          this.figureData = JSON.parse(sessionStorage.getItem('figureData'));
          this.setContent(res);
        }
      }
    });

    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  setContent(res) {
    this.loading = false;
    this.queryParams = res.queryParams;
    this.filter = res.queryParams.filter === 'all' ? null : res.queryParams.filter;

    const parent = this.figureData.find(item => item.id === this.currentParent);
    this.result = [parent.figures.find(item => item.id === this.currentItem)];

    // Get all visualisations into a flat array
    const dataCopy = cloneDeep(this.figureData);
    this.flatData = [];
    dataCopy.forEach(segment => {
      // Hack to get segment header into item (Assign new key / value pair)
      segment.figures.forEach(item => {
        // item.segment = segment['header' + this.currentLocale];
        Object.assign(item, {segment: segment['title' + this.currentLocale]});
      });
      this.flatData.push(segment.figures);
    });
    this.flatData = this.flatData.flat();

    // Filter data if filtering is enabled
    this.flatData = this.filter ? this.flatData.filter(item => item[this.filter]) : this.flatData;

    // Set title
    this.title = this.result[0]['title' + this.currentLocale];
    switch (this.localeId) {
      case 'fi': {
        this.setTitle(this.title + ' - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle(this.title + ' - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle(this.title + ' - Forskning.fi');
        break;
      }
    }

    const titleString = this.titleService.getTitle();
    this.utilityService.addMeta(titleString, this.metaTags['description' + this.currentLocale],
    this.commonTags['imgAlt' + this.currentLocale]);
  }

  ngAfterViewInit() {
    // Sometimes content can't be rendered fast enough so we use changes subsciption as fallback
    if (this.content && this.content.first) {
      this.colWidth = this.content.first.nativeElement.offsetWidth - 15;
      this.cdr.detectChanges();
    } else {
      // It takes some time to load data so we need to subscribe to content ref changes to get first width
      this.contentSub = this.content.changes.subscribe(item => {
        this.colWidth = item.first.nativeElement.offsetWidth - 15;
        this.cdr.detectChanges();
      });
    }
    // Focus to skip-to results link when clicked from header skip-links
    this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.keyboardHelp.nativeElement.focus();
      }
    });
  }

  onResize(dims) {
    this.height = dims.height;
    this.width = dims.width;
    if (this.width >= 992) {
      this.mobile = false;
    } else {
      this.mobile = true;
    }
    this.colWidth = this.content.first.nativeElement.offsetWidth - 15;
  }

  trackByFn(index, item) {
    return index;
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
      this.showInfo = false;
      this.showHelp = false;
  }

  onClickedOutside(event) {
    this.showInfo = false;
  }

  onClickedOutsideHelp(event) {
    this.showHelp = false;
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.contentSub?.unsubscribe();
    this.queryParamSub?.unsubscribe();
  }
}
