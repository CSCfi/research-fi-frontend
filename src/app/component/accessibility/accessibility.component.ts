//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, LOCALE_ID, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ReviewComponent } from 'src/app/ui/review/review.component';
import { UtilityService } from 'src/app/services/utility.service';
import { accessibility, common } from 'src/assets/static-data/meta-tags.json';
import {
  Router,
  RouterEvent,
  NavigationStart,
  NavigationEnd,
  ActivatedRoute
} from '@angular/router';

@Component({
  selector: 'app-accessibility',
  templateUrl: './accessibility.component.html',
  styleUrls: ['./accessibility.component.scss']
})
export class AccessibilityComponent implements OnInit, AfterViewInit, OnDestroy {
  focusSub: Subscription;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  title: string;
  reviewDialogRef: MatDialogRef<ReviewComponent>;
  currentLocale: string;
  loading = true;

  private metaTags = accessibility;
  private commonTags = common;
  content: any[];
  contentSub: Subscription;
  loaded: Promise<boolean>;
  isLoader: boolean;

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService,
              public dialog: MatDialog, private utilityService: UtilityService,
              private router: Router, private route: ActivatedRoute) {
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  ngOnInit(): void {
    // Get page data. Data is passed with resolver in router
    this.content = this.route.snapshot.data.pages.find((e: { placement: string; }) => e.placement === '4');

    // Add meta tags and title
    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
    this.metaTags['description' + this.currentLocale],
    this.commonTags['imgAlt' + this.currentLocale]);
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Saavutettavuusseloste - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Accessibility - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Tillgänglighetsredogörelse - Forskning.fi');
        break;
      }
    }
    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);

    this.title = this.getTitle();
  }


  routerEvents() {
    this.router.events.subscribe((event: RouterEvent) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.isLoader = true;
          break;
        }
        case event instanceof NavigationEnd: {
          this.isLoader = false;
          break;
        }
      }
    });
  }

  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  getTitle() {
    return this.titleService.getTitle().split('-').shift().trim();
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });

    // Add review toggle onclick functionality to corresponding ling
    const reviewLink = document.getElementById('toggle-review');
    if (reviewLink) {
      reviewLink.addEventListener('click',  (evt: Event) => this.toggleReview());
    }

  }

  toggleReview() {
    this.reviewDialogRef = this.dialog.open(ReviewComponent, {
      maxWidth: '800px',
      minWidth: '320px',
      // minHeight: '60vh'
    });
  }


  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
    this.contentSub?.unsubscribe();
  }
}
