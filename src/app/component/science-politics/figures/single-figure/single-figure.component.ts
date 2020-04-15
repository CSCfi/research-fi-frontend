// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, Inject, LOCALE_ID, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-figure',
  templateUrl: './single-figure.component.html',
  styleUrls: ['./single-figure.component.scss']
})
export class SingleFigureComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('content') content: ElementRef;
  data = [
    {
      labelFi: 'Yliopistojen opetus- ja tutkimushenkilöstön henkilötyövuodet uraportaittain',
      // link: 'https://app.powerbi.com/view?r=eyJrIjoiOGVhOTg0ZjItM2U2MS00NmRiLWJhMDItMGY4MmUxMWJhOWQzIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      link: 'https://app.powerbi.com/view?r=eyJrIjoiZTMwNjVkMzctNWQwMC00ZTEwLTk3ZjktMzc5OWRkNThlYjYzIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  ];

  colWidth: number;
  faQuestion = faQuestionCircle;
  resizeSub: Subscription;

  constructor( private cdr: ChangeDetectorRef, private titleService: Title, @Inject( LOCALE_ID ) protected localeId: string,
               private resizeService: ResizeService ) { }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit(): void {
    switch (this.localeId) {
      case 'fi': {
        this.setTitle(this.data[0].labelFi + ' - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        // Change labelEn at some point
        this.setTitle(this.data[0].labelFi + ' - Research.fi');
        break;
      }
    }
    this.resizeSub = this.resizeService.onResize$.subscribe(_ => this.onResize());
  }

  ngAfterViewInit() {
    this.colWidth = this.content.nativeElement.offsetWidth - 15;
    this.cdr.detectChanges();
  }

  onResize() {
    this.colWidth = this.content.nativeElement.offsetWidth - 15;
  }

  trackByFn(index, item) {
    return index;
  }

  ngOnDestroy() {
    this.resizeSub.unsubscribe();
  }
}
