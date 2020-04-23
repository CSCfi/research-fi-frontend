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

@Component({
  selector: 'app-single-figure',
  templateUrl: './single-figure.component.html',
  styleUrls: ['./single-figure.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SingleFigureComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('content') content: QueryList<ElementRef>;

  dataContent = content;

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

  constructor( private cdr: ChangeDetectorRef, private titleService: Title, @Inject( LOCALE_ID ) protected localeId: string,
               private resizeService: ResizeService, private searchService: SearchService, private route: ActivatedRoute,
               @Inject(WINDOW) private window: Window ) { }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit(): void {
    // Subscribe to route and get parent and path from params
    this.routeSub = this.route.params.subscribe(param => {
      this.currentParent = param.id.slice(0, 2);
      this.currentItem = param.id;
    });

    // Get data from assets by parent and content link
    const parent = this.dataContent.find(item => item.id === this.currentParent);
    this.result = [parent.items.find(item => item.link === this.currentItem)];

    // Set title
    this.label = this.result[0].labelFi;
    switch (this.localeId) {
      case 'fi': {
        this.setTitle(this.label + ' - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        // Change labelEn at some point
        this.setTitle(this.label + ' - Research.fi');
        break;
      }
    }

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

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        this.showInfo = false;
        this.showHelp = false;
    }
  }

  onClickedOutside(event) {
    this.showInfo = false;
  }

  onClickedOutsideHelp(event) {
    this.showHelp = false;
  }

  ngOnDestroy() {
    this.resizeSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.contentSub?.unsubscribe();
  }
}
