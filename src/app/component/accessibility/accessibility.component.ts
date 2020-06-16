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
import { accessibility, common } from 'src/assets/static-data/meta-tags.json'


@Component({
  selector: 'app-accessibility',
  templateUrl: './accessibility.component.html',
  styleUrls: ['./accessibility.component.scss']
})
export class AccessibilityComponent implements OnInit, AfterViewInit, OnDestroy {
  focusSub: Subscription;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  title: string;
  reviewDialogRef: MatDialogRef<ReviewComponent>;
  private currentLocale: string;

  // Remove this after translations
  templateLocale: string;

  private metaTags = accessibility;
  private commonTags = common;


  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService,
              public dialog: MatDialog, private utilityService: UtilityService) {
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  ngOnInit(): void {
    this.templateLocale = this.localeId;
    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
    this.metaTags['description' + this.currentLocale],
    this.commonTags['imgAlt' + this.currentLocale])
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
  }

}