//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewChild, ViewChildren, ElementRef, Inject, PLATFORM_ID, QueryList, AfterViewInit,
  HostListener, ChangeDetectorRef, LOCALE_ID, OnDestroy } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';
import { News } from 'src/app/models/news.model';

@Component({
  providers: [SearchBarComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  allData: any [];
  errorMessage = [];
  status = false;
  news: News[] = [];
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

  resizeSub: Subscription;

  shortcuts = [
    {
      title: 'Suomen tiede ja tutkimus lukuina',
      caption: 'Tutustu tilastoihin tutkimuksen henkilöstöstä, rahoituksesta ja julkaisutoiminnasta',
      imgPath: 'assets/img/home/finnish_science_state.jpg',
      col: 6,
      link: '/science-innovation-politics/science-research-figures',
      alt: ''
    },
    {
      title: 'Suomalainen tutkimus- ja innovaatiojärjestelmä',
      caption: 'Mistä suomalainen tutkimusjärjestelmä koostuu?',
      imgPath: 'assets/img/home/research_innovation.jpg',
      col: 6,
      // link: '/visual/publications',
      link: '/science-innovation-politics/research-innovation-system',
      alt: ''

    },
    {
      title: 'Uusimmat tutkimushankkeet',
      caption: 'Tutustu uusimpiin tutkimusrahoituspäätöksiin',
      imgPath: 'assets/img/home/funding.jpg',
      col: 4,
      link: '/results/fundings',
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
      link: '/results/publications',
      last: true,
      alt: ''
    }
  ];
  focusSub: any;

  constructor( private searchService: SearchService, private sortService: SortService, private searchBar: SearchBarComponent,
               private titleService: Title, @Inject(DOCUMENT) private document: any, @Inject(PLATFORM_ID) private platformId: object,
               private cdr: ChangeDetectorRef, @Inject(LOCALE_ID) protected localeId: string,private tabChangeService: TabChangeService,
               private resizeService: ResizeService, private metaService: Meta ) {

               }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit() {
    // Reset search term
    this.searchService.updateInput('');

    // Get data for count-ups
    this.getAllData();

    // Get news data
    this.searchService.getNews(3).subscribe(data => this.news = data);

    // Reset sort
    this.sortService.updateSort('');

    // Set title
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Etusivu - Tiedejatutkimus.fi');
        this.metaService.addTags([
          { name: 'description', content: 'Tiedejatutkimus.fi - Betaversion etusivu' },
          { property: 'og:title', content: 'Tiedejatutkimus.fi - Betaversion etusivu' },
          { property: 'og:description', content: 'Etusivulta pääset kätevästi selaamaan hakutuloksia, uusimpia tiedeuutisia tai tilastoja suomen tieteen tilasta' },
          { property: 'og:image', content: 'assets/img/logo.svg' },
          { property: 'og:image:alt', content: 'Tutkimustietovarannon portaalin logo, abstrakti ikkuna' },
          { property: 'og:image:height', content: '100' },
          { property: 'og:image:width', content: '100' },
       ]);
        break;
      }
      case 'en': {
        this.setTitle('Home - Research.fi');
        break;
      }
    }
    this.srHeader.nativeElement.innerHTML = this.document.title.split(' - ', 1);

    this.resizeSub = this.resizeService.onResize$.subscribe(_ => this.onResize());

    // Reset local storage
    // if (isPlatformBrowser(this.platformId)) {
    //   localStorage.removeItem('Pagenumber');
    //   localStorage.setItem('Pagenumber', JSON.stringify(1));
    // }
  }

  onResize() {
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
        this.tabChangeService.targetFocus(null);
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

  ngOnDestroy() {
    this.resizeSub.unsubscribe();
  }
}
