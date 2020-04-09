//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewChild, ViewChildren, ElementRef, Inject, PLATFORM_ID, QueryList, AfterViewInit,
  HostListener, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { TabChangeService } from 'src/app/services/tab-change.service';

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
  @ViewChild('main') mainContent: ElementRef;
  basicStyle = {
    border: '0px',
    background: 'white',
    margin: '6px 0 6px',
    'min-width': '200px'
  };
  maxHeight: number;

  shortcuts = [
    {
      title: 'Suomen tiede ja tutkimus lukuina',
      caption: 'Tutustu tilastoihin mm. julkaisutoiminnasta, henkilöstövoimavaroista ja tutkimus- ja kehittämistoiminnan intensiteetistä',
      imgPath: 'assets/img/home/finnish_science_state.jpg',
      col: 6,
      link: '#',
      alt: ''
    },
    {
      title: 'Suomalainen tutkimus- ja innovaatiojärjestelmä',
      caption: 'Mistä suomalainen tutkimusjärjestelmä koostuu?',
      imgPath: 'assets/img/home/research_innovation.jpg',
      col: 6,
      link: '/science-innovation-politics/research-innovation-system',
      alt: ''

    },
    {
      title: 'Uusimmat tutkimushankkeet',
      caption: 'Tutustu uusimpiin tutkimusrahoituspäätöksiin',
      imgPath: 'assets/img/home/funding.jpg',
      col: 4,
      link: '#',
      alt: ''
    },
    {
      title: 'Tietoa palvelusta',
      caption: 'Mitä tiedejatutkimus.fi sisältää? Miten tutkijana saat tietosi palveluun? Miten palvelua käytetään?',
      imgPath: 'assets/img/home/info.jpg',
      col: 4,
      link: '/service-info',
      alt: ''
    },
    {
      title: 'Etsi julkaisuja!',
      caption: 'Etsi tietoa suomalaisten tutkimusorganisaatioiden julkaisuista',
      imgPath: 'assets/img/home/search.jpg',
      col: 4,
      link: '#',
      last: true,
      alt: ''
    }
  ];
  focusSub: any;

  constructor( private searchService: SearchService, private sortService: SortService, private searchBar: SearchBarComponent,
               private titleService: Title, @Inject(DOCUMENT) private document: any, @Inject(PLATFORM_ID) private platformId: object,
               private cdr: ChangeDetectorRef, @Inject(LOCALE_ID) protected localeId: string,private tabChangeService: TabChangeService ) {

               }

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
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Etusivu - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Home - Research.fi');
        break;
      }
    }
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
    // Focus first element when clicked with skip-link
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainContent?.nativeElement.focus();
      }
    });
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
