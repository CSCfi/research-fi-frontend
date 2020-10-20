// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ElementRef, AfterViewInit, ChangeDetectorRef, Inject, LOCALE_ID, OnDestroy,
         ViewChildren, QueryList, HostListener, ViewEncapsulation, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { WINDOW } from 'src/app/services/window.service';
import { content } from '../../../../../assets/static-data/figures-content.json';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { UtilityService } from 'src/app/services/utility.service';
import { singleFigure, common } from 'src/assets/static-data/meta-tags.json'


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
  label: any;
  mobile = this.window.innerWidth < 992;
  height = this.window.innerHeight;
  width = this.window.innerWidth;
  showInfo = false;
  showHelp = false;
  currentLocale: string;
  private metaTags = singleFigure;
  private commonTags = common;


  constructor( private cdr: ChangeDetectorRef, private titleService: Title, @Inject( LOCALE_ID ) protected localeId: string,
               private resizeService: ResizeService, private searchService: SearchService, private route: ActivatedRoute,
               @Inject(WINDOW) private window: Window, private tabChangeService: TabChangeService,
               private utilityService: UtilityService) {
                  // Capitalize first letter of locale
                  this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
                }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit(): void {
    // Subscribe to route and get parent and path from params
    this.routeSub = this.route.params.subscribe(param => {
      this.currentParent = param.id.slice(0, 2);
      this.currentItem = param.id;
      // Get data from assets by parent and content link
      const parent = this.dataContent.find(item => item.id === this.currentParent);
      this.result = [parent.items.find(item => item.link === this.currentItem)];
    });

    // Set title
    this.label = this.result[0]['label' + this.currentLocale];
    switch (this.localeId) {
      case 'fi': {
        this.setTitle(this.label + ' - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle(this.label + ' - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle(this.label + ' - Forskning.fi');
        break;
      }
    }

    const titleString = this.titleService.getTitle();
    this.utilityService.addMeta(titleString, this.metaTags['description' + this.currentLocale], this.commonTags['imgAlt' + this.currentLocale])


    // Get all visualisations into a flat array
    this.dataContent.forEach(segment => {
      // Hack to get segment header into item (replace an unused field with it)
      segment.items.forEach(item => item.segment = segment['header' + this.currentLocale]);
      this.flatData.push(segment.items);
    });
    this.flatData = this.flatData.flat();


    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
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
  }
}
