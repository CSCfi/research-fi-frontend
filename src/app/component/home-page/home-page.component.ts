//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewChild, ViewChildren, ElementRef, Inject, PLATFORM_ID, QueryList, AfterViewInit,
  HostListener, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  providers: [SearchBarComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, AfterViewInit {
  allData: any [];
  errorMessage = [];
  status = false;
  myOps = {
    duration: 0.5
  };
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChildren('shortcutItem') shortcutItem: QueryList<ElementRef>;
  basicStyle = {
    border: '0px',
    background: 'white',
    margin: '6px 0 6px',
    'min-width': '200px'
  };
  maxHeight: number;

  shortcuts = [
    {
      title: 'Suomen tieteen tila numeroina',
      caption: 'Tutustu visualisointeihin ja tilastoihin Suomen tieteen tilasta.',
      imgPath: 'assets/1.jpg',
      col: 4,
      link: '#',
      alt: ''
    },
    {
      title: 'Tutki julkaisujen määriä tieteenaloittain',
      caption: 'Etsi tietoa esim. tutkijoista, julkaisuista ja muista tutkimuksen tuotoksista sekä tutkimusinfrastruktuureista.',
      imgPath: 'assets/treemap_vis.png',
      col: 8,
      link: '/visual/publications',
      alt: ''

    },
    {
      title: 'Suomalainen tutkimusjärjestelmä',
      caption: 'Mistä kaikesta suomalainen tutkimusjärjestelmä koostuu?',
      imgPath: 'assets/4.jpg',
      col: 4,
      link: '#',
      alt: ''
    },
    {
      title: 'Uusimmat tutkimushankkeet',
      caption: 'Tutustu uusimpiin tutkimushankkeisiin.',
      imgPath: 'assets/5.jpg',
      col: 4,
      link: '#',
      alt: ''
    },
    {
      title: 'Etsi ja löydä uutta',
      caption: 'Etsi tietoa esim. tutkijoista, julkaisuista ja muista tutkimuksen tuotoksista sekä tutkimusinfrastruktuureista',
      imgPath: 'assets/6.jpg',
      col: 4,
      link: '#',
      last: true,
      alt: ''
    }
  ];

  constructor( private searchService: SearchService, private sortService: SortService, private searchBar: SearchBarComponent,
               private titleService: Title, @Inject(DOCUMENT) private document: any, @Inject(PLATFORM_ID) private platformId: object,
               private cdr: ChangeDetectorRef ) { }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit() {
    // Reset search term
    this.searchService.updateInput('');

    // Get data for count-ups
    this.getAllData();

    // Reset sort
    this.sortService.updateSort('');

    // Set title
    this.setTitle('Etusivu - Tutkimustietovaranto');
    this.srHeader.nativeElement.innerHTML = this.document.title.split(' - ', 1);

    // Reset local storage
    // if (isPlatformBrowser(this.platformId)) {
    //   localStorage.removeItem('Pagenumber');
    //   localStorage.setItem('Pagenumber', JSON.stringify(1));
    // }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // Timeout needs to be added because shortcutItem list doesn't keep up with resize
    setTimeout(x => {
      this.getHeight();
    }, 200);
  }

  ngAfterViewInit() {
    this.getHeight();
  }

  // Get height of div with most height
  getHeight() {
    const heightArr = [];
    this.shortcutItem.forEach(item => {
      heightArr.push(item.nativeElement.firstElementChild.offsetHeight);
    });
    this.maxHeight = Math.max(...heightArr) + 30;

    this.cdr.detectChanges();
  }

  getAllData() {
    this.searchService.getAllResultCount()
    .pipe(map(allData => [allData]))
    .subscribe(allData => this.allData = allData,
      error => this.errorMessage = error as any);
  }
}
