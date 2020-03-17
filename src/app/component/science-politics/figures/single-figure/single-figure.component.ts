// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-single-figure',
  templateUrl: './single-figure.component.html',
  styleUrls: ['./single-figure.component.scss']
})
export class SingleFigureComponent implements OnInit, AfterViewInit {
  @ViewChild('content') content: ElementRef;
  data = [
    {
      labelFi: 'Yliopistojen opetus- ja tutkimushenkilöstön henkilötyövuodet uraportaittain',
      link: 'https://app.powerbi.com/view?r=eyJrIjoiOGVhOTg0ZjItM2U2MS00NmRiLWJhMDItMGY4MmUxMWJhOWQzIiwidCI6IjkxMDczODlkLTQ0YjgtNDcxNi05ZGEyLWM0ZTNhY2YwMzBkYiIsImMiOjh9',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  ];

  colWidth: number;
  faQuestion = faQuestionCircle;

  constructor( public sanitizer: DomSanitizer, private cdr: ChangeDetectorRef, private titleService: Title ) { }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit(): void {
    this.setTitle(this.data[0].labelFi + ' - Tiede ja tutkimus lukuina - Tutkimustietovaranto');
  }

  ngAfterViewInit() {
    this.colWidth = this.content.nativeElement.offsetWidth - 15;
    this.cdr.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.colWidth = this.content.nativeElement.offsetWidth - 15;
  }

}
