// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ViewChild, ElementRef, LOCALE_ID, Inject, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { TabChangeService } from '@portal.services/tab-change.service';
import { ResizeService } from '@portal.services/resize.service';
import { Subscription } from 'rxjs';
import { researchInnovation, common } from '@portal.assets/static-data/meta-tags.json';
import { UtilityService } from '@portal.services/utility.service';
import { ActivatedRoute } from '@angular/router';
import { Sector } from '@portal.models/research-innovation-system/sector.model';

@Component({
  selector: 'app-research-innovation-system',
  templateUrl: './research-innovation-system.component.html',
  styleUrls: ['./research-innovation-system.component.scss']
})
export class ResearchInnovationSystemComponent implements OnInit, AfterViewInit, OnDestroy {
  faTimes = faTimes;
  openedIdx = -1;

  private metaTags = researchInnovation;
  private commonTags = common;

  colWidth = 0;

  introText: any;

  selectedSector: any;
  rearrangedList: any[];
  @ViewChild('openSector') openSector: ElementRef;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('iframe') iframe: ElementRef;
  focusSub: Subscription;
  resizeSub: Subscription;
  currentLocale: string;
  sectorDataSub: Subscription;
  sectorData: Sector[] = [];

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, public sanitizer: DomSanitizer,
              private tabChangeService: TabChangeService, private cdr: ChangeDetectorRef, private resizeService: ResizeService,
              private utilityService: UtilityService, private route: ActivatedRoute) {
    this.selectedSector = null;
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit(): void {
    // Get data. Data is passed with resolver in router
    const pageData = this.route.snapshot.data.pages;
    this.introText = pageData.find(el => el.id === 'science-innovation-system');

    this.sectorData = this.route.snapshot.data.sectorData;

    // Set title and meta tags
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tutkimus- ja innovaatiojärjestelmä - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Research and innovation system - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Finländskt forsknings- och innovationssystem - Forskning.fi');
        break;
      }
    }

    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
                                this.metaTags['description' + this.currentLocale],
                                this.commonTags['imgAlt' + this.currentLocale])


    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);
    this.resizeSub = this.resizeService.onResize$.subscribe(_ => this.onResize());
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
    this.colWidth = this.iframe.nativeElement.offsetWidth;
    this.cdr.detectChanges();
  }

  onResize() {
    this.colWidth = this.iframe.nativeElement.offsetWidth;
  }

  trackByFn(index) {
    return index;
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
    this.focusSub?.unsubscribe();
    this.sectorDataSub?.unsubscribe();
  }

}
