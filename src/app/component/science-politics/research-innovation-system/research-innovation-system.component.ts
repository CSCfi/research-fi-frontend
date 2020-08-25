// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ViewChild, ElementRef, LOCALE_ID, Inject, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { faLandmark, faEuroSign, faTimes, faHospital, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { sector } from '../../../../assets/static-data/research-innovation-system.json';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';
import { researchInnovation, common } from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-research-innovation-system',
  templateUrl: './research-innovation-system.component.html',
  styleUrls: ['./research-innovation-system.component.scss']
})
export class ResearchInnovationSystemComponent implements OnInit, AfterViewInit, OnDestroy {
  faLandmark = faLandmark;
  faEuroSign = faEuroSign;
  faHospital = faHospital;
  faBuilding = faBuilding;
  faTimes = faTimes;
  openedIdx = -1;

  private metaTags = researchInnovation;
  private commonTags = common;

  colWidth = 0;

  introText: any;

  sectorList = [
    {
      id: 0,
      label: $localize`:@@universities:Yliopistot`,
      icon: faLandmark,
      data: sector.university,
      iframeUrlFi: 'https://app.powerbi.com/view?r=eyJrIjoiMTZmY2RiZGMtMGNmMS00M2I5LTkwYTYtZTI5NjI0NWVjMTYwIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlEn: 'https://app.powerbi.com/view?r=eyJrIjoiYTk3YTA3OWItMmM5Zi00MmMyLWIwNDAtYzM5NTU0YzAzM2MxIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlSv: 'https://app.powerbi.com/view?r=eyJrIjoiMTI1NzA5ZDUtZTg3Yi00MTRhLTg2M2UtMmEwYjRiNmMxOWY1IiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
    {
      id: 1,
      label: $localize`:@@universitiesAS:Ammattikorkeakoulut`,
      icon: faLandmark,
      data: sector.applied_university,
      iframeUrlFi: 'https://app.powerbi.com/view?r=eyJrIjoiNmJmNTU1ZGQtYTgxNS00ZTg1LTliMDAtNzU2NzE2N2RhZjNiIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlEn: 'https://app.powerbi.com/view?r=eyJrIjoiNTkyZWM2ZDctYjQ4Yy00NGRhLWE4MTAtNWZlOWM5MTFjNTg5IiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlSv: 'https://app.powerbi.com/view?r=eyJrIjoiZGJiMjA5MTItMjMxZi00OWYyLTgyMDQtYzRiM2RhY2EzOWY5IiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
    {
      id: 2,
      label: $localize`:@@stateRI:Valtion tutkimuslaitokset`,
      icon: faBuilding,
      data: sector.state_research,
      iframeUrlFi: 'https://app.powerbi.com/view?r=eyJrIjoiNTQzMWU2NzMtNmNhZS00MzI1LTliYmQtMTk4ODAwNjFkMmYxIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlEn: 'https://app.powerbi.com/view?r=eyJrIjoiYjI0NzllZTktOGY5NC00NmJiLWFhMDMtMzc4Y2I0YjJmZDkxIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlSv: 'https://app.powerbi.com/view?r=eyJrIjoiNTVkYTMyYjMtMmM0MC00NTU4LTg5NzktMzhjYWEyNWY5NmFjIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
    {
      id: 3,
      label: $localize`:@@uniHospitals:Yliopistolliset sairaalat`,
      icon: faHospital,
      data: sector.university_hospital,
      iframeUrlFi: 'https://app.powerbi.com/view?r=eyJrIjoiYjk2M2ZkMzYtMTg5OS00NjI3LThkOTktMWI2ODhlMDA2MjU2IiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlEn: 'https://app.powerbi.com/view?r=eyJrIjoiZmI2YWY4YTAtZDVkNi00NjBjLWFhNTgtY2M2ZTM3YjViMjFkIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlSv: 'https://app.powerbi.com/view?r=eyJrIjoiZDRiYmFmYjAtMzVmZS00ZDdiLThhMmYtZTA3YjMzYTFhZjZiIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
    {
      id: 4,
      label: $localize`:@@otherRF:Muut tutkimuslaitokset`,
      icon: faBuilding,
      data: sector.other_research,
      iframeUrlFi: '',
      iframeUrlEn: '',
      iframeUrlSv: ''
    },
    {
      id: 5, label: $localize`:@@researchFunders:Tutkimuksen rahoittajat`,
      icon: faEuroSign,
      data: sector.funders,
      iframeUrlFi: 'https://app.powerbi.com/view?r=eyJrIjoiNGFkN2Q2M2YtY2NmZC00MjExLTgwOWYtNzllYmQ0OTU3NWQyIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlEn: 'https://app.powerbi.com/view?r=eyJrIjoiOGQ5ZmY0NTctZGI3NC00ZWRlLTgxZDEtNTAxMmFhYTZkYjJkIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      iframeUrlSv: 'https://app.powerbi.com/view?r=eyJrIjoiZjI1N2FmODItOTk0Mi00ZmFhLThjMWQtMzIzNGMwYWIzZjYxIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
  ];

  selectedSector: any;
  rearrangedList: any[];
  @ViewChild('openSector') openSector: ElementRef;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('iframe') iframe: ElementRef;
  focusSub: Subscription;
  resizeSub: Subscription;
  currentLocale: string;

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, public sanitizer: DomSanitizer,
              private tabChangeService: TabChangeService, private cdr: ChangeDetectorRef, private resizeService: ResizeService,
              private utilityService: UtilityService) {
    this.selectedSector = null;
    this.rearrangedList = this.sectorList;
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  changeOrder(i) {
    this.rearrangedList = [];
    const data = [...this.sectorList];
    data.splice(i, 1);
    data.unshift(this.sectorList[i]);
    this.rearrangedList = data;
  }

  toggleOpen(i) {

  }

  ngOnInit(): void {
    this.introText = sector.intro['description' + this.currentLocale].join('');

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

  trackByFn(index, item) {
    return index;
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
    this.focusSub?.unsubscribe();
  }

}
