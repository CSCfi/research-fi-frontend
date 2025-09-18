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
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
} from '@angular/core';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { Subscription } from 'rxjs';
import { UtilityService } from 'src/app/shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT, isPlatformBrowser, NgIf } from '@angular/common';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SanitizeHtmlPipe } from '../../../shared/pipes/sanitize-html.pipe';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { ReviewComponent } from '../../../shared/components/review/review.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BannerDividerComponent } from '../../../shared/components/banner-divider/banner-divider.component';

@Component({
    selector: 'app-accessibility',
    templateUrl: './accessibility.component.html',
    styleUrls: ['./accessibility.component.scss'],
    imports: [
        BannerDividerComponent,
        BreadcrumbComponent,
        ReviewComponent,
        NgIf,
        DialogComponent,
        SanitizeHtmlPipe,
    ]
})
export class AccessibilityComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  focusSub: Subscription;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('contentContainer', { static: false })
  contentContainer: ElementRef;
  title: string;
  showDialog: boolean;
  currentLocale: string;
  loading = true;

  private metaTags = MetaTags.accessibility;
  private commonTags = MetaTags.common;
  content: any[];

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    // Get page data. Data is passed with resolver in router
    this.content = this.route.snapshot.data.pages.find(
      (e: { id: string }) => e.id === 'accessibility'
    );

    // Add meta tags and title
    this.utilityService.addMeta(
      this.metaTags['title' + this.currentLocale],
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );
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
    this.loading = false;
  }

  setTitle(title: string) {
    this.utilityService.setTitle(title);
  }

  getTitle() {
    return this.utilityService.getTitle().split('-').shift().trim();
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.mainFocus.nativeElement.focus();
        }
      }
    );

    // Add review toggle onclick functionality to corresponding link
    if (isPlatformBrowser(this.platformId)) {
      const reviewLink = this.document.getElementById('toggle-review');
      if (reviewLink) {
        reviewLink.setAttribute('href', 'javascript:void(0)');
        reviewLink.addEventListener('click', (evt: Event) =>
          this.toggleReview()
        );
      }
    }
  }

  toggleReview() {
    this.showDialog = !this.showDialog;
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');

    this.focusSub?.unsubscribe();
  }
}
