// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ViewChild, ElementRef, LOCALE_ID, Inject, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { faLandmark, faEuroSign, faTimes, faHospital, faBuilding, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Title, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { sector } from '../../../../assets/static-data/research-innovation-system.json';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';

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

  colWidth = 0;

  sectorList = [
    {
      id: 0,
      labelFi: 'Yliopistot',
      icon: faLandmark,
      data: sector.university,
      iframeUrl: 'https://app.powerbi.com/view?r=eyJrIjoiZTMwNjVkMzctNWQwMC00ZTEwLTk3ZjktMzc5OWRkNThlYjYzIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
    {
      id: 1,
      labelFi: 'Ammattikorkeakoulut',
      icon: faLandmark,
      data: sector.applied_university,
      iframeUrl: 'https://app.powerbi.com/view?r=eyJrIjoiOTg0NzAyOGItOGQzYS00NDBhLTg3NDUtODliMGM5MDQ5MDg2IiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
    {
      id: 2,
      labelFi: 'Valtion tutkimuslaitokset',
      icon: faBuilding,
      data: sector.state_research,
      iframeUrl: 'https://app.powerbi.com/view?r=eyJrIjoiOGVmYmYwZGEtMWNiOC00ZjM3LTg1NjgtNGEwZDM2ZTkxNWIzIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
    {
      id: 3,
      labelFi: 'Yliopistolliset sairaalat',
      icon: faHospital,
      data: sector.university_hospital,
      iframeUrl: 'https://app.powerbi.com/view?r=eyJrIjoiZTk1N2NhODAtNDgyMC00OThkLTg1NWYtNWEwZDg3OWJhZGU5IiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
    },
    {
      id: 4,
      labelFi: 'Muut tutkimuslaitokset',
      icon: faBuilding,
      data: sector.other_research,
      iframeUrl: ''
    },
    {
      id: 5, labelFi:
      'Tutkimuksen rahoittajat',
      icon: faEuroSign,
      data: sector.funders,
      iframeUrl: '',
    },
  ];

  selectedSector: any;
  rearrangedList: any[];
  @ViewChild('openSector') openSector: ElementRef;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('iframe') iframe: ElementRef;
  focusSub: Subscription;
  resizeSub: Subscription;

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, public sanitizer: DomSanitizer,
              private tabChangeService: TabChangeService, private cdr: ChangeDetectorRef, private resizeService: ResizeService) {
    this.selectedSector = null;
    this.rearrangedList = this.sectorList;
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
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tutkimus- ja innovaatiojärjestelmä - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        // Todo: Translate
        this.setTitle('Tutkimus- ja innovaatiojärjestelmä - Research.fi');
        break;
      }
    }

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
    this.focusSub.unsubscribe();
  }

}
