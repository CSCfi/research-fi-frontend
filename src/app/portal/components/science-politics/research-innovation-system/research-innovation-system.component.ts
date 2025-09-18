// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  LOCALE_ID,
  Inject,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { Subscription } from 'rxjs';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Sector } from 'src/app/portal/models/research-innovation-system/sector.model';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { BannerDividerComponent } from '../../../../shared/components/banner-divider/banner-divider.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-research-innovation-system',
    templateUrl: './research-innovation-system.component.html',
    styleUrls: ['./research-innovation-system.component.scss'],
    imports: [
        BannerDividerComponent,
        MatAccordion,
        NgFor,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        NgClass,
        NgIf,
        RouterLink,
        SafeUrlPipe,
        SvgSpritesComponent
    ]
})
export class ResearchInnovationSystemComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  openedIdx = -1;

  private metaTags = MetaTags.researchInnovation;
  private commonTags = MetaTags.common;

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
  sectorData: Sector[] = [];

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    public sanitizer: DomSanitizer,
    private tabChangeService: TabChangeService,
    private cdr: ChangeDetectorRef,
    private resizeService: ResizeService,
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private appSettingsService: AppSettingsService
  ) {
    this.selectedSector = null;

    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit(): void {
    // Get data. Data is passed with resolver in router
    const pageData = this.route.snapshot.data.pages;
    this.introText = pageData ? pageData.find(
      (el) => el.id === 'science-innovation-system') : '';
    this.sectorData = this.route.snapshot.data.sectorData;

    // Set title and meta tags
    switch (this.localeId) {
      case 'fi': {
        this.setTitle(
          'Tutkimus- ja innovaatiojärjestelmä - Tiedejatutkimus.fi'
        );
        break;
      }
      case 'en': {
        this.setTitle('Research and innovation system - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle(
          'Finländskt forsknings- och innovationssystem - Forskning.fi'
        );
        break;
      }
    }

    this.utilityService.addMeta(
      this.metaTags['title' + this.currentLocale],
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );

    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);
    this.resizeSub = this.resizeService.onResize$.subscribe((_) =>
      this.onResize()
    );
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.mainFocus.nativeElement.focus();
        }
      }
    );
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
    this.resizeSub?.unsubscribe();
    this.focusSub?.unsubscribe();
  }
}
