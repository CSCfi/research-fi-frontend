//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewChild, ViewChildren, ElementRef, Inject, PLATFORM_ID, QueryList, AfterViewInit,
         ChangeDetectorRef, LOCALE_ID, OnDestroy } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title, } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';
import { News } from 'src/app/models/news.model';
import { UtilityService } from 'src/app/services/utility.service';
import { homepage, common } from 'src/assets/static-data/meta-tags.json';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReviewComponent } from 'src/app/ui/review/review.component';
import { PrivacyService } from 'src/app/services/privacy.service';
import { WINDOW } from 'src/app/services/window.service';

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
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChildren('shortcutItem') shortcutItem: QueryList<ElementRef>;
  @ViewChild('main') mainContent: ElementRef;
  basicStyle = {
    border: '0px',
    background: 'white',
    margin: '6px 0 6px',
    minWidth: '180px',
  };
  maxHeight: number;

  resizeSub: Subscription;

  private metaTags = homepage;
  private commonTags = common;

  shortcuts = [
    {
      titleFi: 'Lukuja tieteestä ja tutkimuksesta',
      titleEn: 'Figures on science and research',
      titleSv: 'Siffror om vetenskap och forskning',
      captionFi: 'Tutustu tilastoihin tutkimuksen henkilöstöstä, rahoituksesta ja julkaisutoiminnasta',
      captionEn: 'Read statistics on research personnel, funding and publishing.',
      captionSv: 'Bekanta dig med statistiken över forskningspersonalen samt finansieringen och publikationsverksamheten.',
      imgPath: 'assets/img/home/finnish_science_state.jpg',
      col: 6,
      link: '/science-innovation-policy/science-research-figures',
      alt: ' '
    },
    {
      titleFi: 'Uusimmat tutkimushankkeet',
      titleEn: 'Latest research projects',
      titleSv: 'De senaste forskningsprojekten',
      captionFi: 'Tutustu uusimpiin tutkimusrahoituspäätöksiin',
      captionEn: 'See the latest research funding decisions',
      captionSv: 'Bekanta dig med de senaste besluten om forskningsfinansiering',
      imgPath: 'assets/img/home/funding.jpg',
      col: 4,
      link: '/results/fundings',
      alt: ' '
    },
    {
      titleFi: 'Suomalainen tutkimus- ja innovaatiojärjestelmä',
      titleEn: 'Research and innovation system in Finland',
      titleSv: 'Forskningssystem i Finland',
      captionFi: 'Mistä suomalainen tutkimusjärjestelmä koostuu?',
      captionEn: 'What does the Finnish research system consist of?',
      captionSv: 'Vad består det finländska forskningssystemet av?',
      imgPath: 'assets/img/home/research_innovation.jpg',
      col: 6,
      link: '/science-innovation-policy/research-innovation-system',
      alt: ' '
    },
    {
      titleFi: 'Anna palautetta',
      titleEn: 'Give feedback',
      titleSv: 'Ge respons',
      captionFi: 'Kerro meille ajatuksiasi palvelusta. Sekä kehut että huomaamasi puutteet ovat tervetulleita. Otamme mielellämme vastaan myös uusia ideoita palvelun kehittämiseksi.',
      captionEn: 'Let us know your thoughts about the service. We welcome both the strengths and shortcomings you notice. We are also happy to hear about new ideas for developing the service.',
      captionSv: 'Låt oss veta dina tankar om tjänsten. Både ris och ros är välkomna. Gärna hör vi också nya utvecklingsidéer.',
      imgPath: 'assets/img/home/feedback.jpg',
      col: 6,
      link: '#',
      alt: ' ',
      toggleReview: true
    },
    {
      titleFi: 'Tietoa palvelusta',
      titleEn: 'About the Service',
      titleSv: 'Information om tjänsten',
      captionFi: 'Mitä tiedejatutkimus.fi sisältää? Miten tutkijana saat tietosi palveluun? Miten palvelua käytetään?',
      captionEn: 'What is found in research.fi? How do you make your information visible the service as a researcher? How do I use the service?',
      captionSv: 'Vad innehåller forskning.fi? Hur får du som forskare information om tjänsten? Hur används tjänsten?',
      imgPath: 'assets/img/home/info.jpg',
      col: 4,
      link: '/service-info',
      alt: ' '
    },
    {
      titleFi: 'Anna palautetta',
      titleEn: 'Give feedback',
      titleSv: 'Ge respons',
      captionFi: 'Voit antaa palautetta tästä verkkopalvelusta',
      captionEn: 'You can give feedback on this online service',
      captionSv: 'Du kan lämna respons om webbtjänsten',
      imgPath: 'assets/img/home/search.jpg',
      col: 4,
      link: '/service-info',
      alt: ' '
    },
    {
      titleFi: 'Etsi julkaisuja!',
      titleEn: 'Search for publications!',
      titleSv: 'Sök publikationer!',
      captionFi: 'Etsi tietoa suomalaisten tutkimusorganisaatioiden julkaisuista',
      captionEn: 'Search for information on publications by Finnish research organizations',
      captionSv: 'Sök information i finländska forskningsorganisationers publikationer',
      imgPath: 'assets/img/home/search.jpg',
      col: 4,
      link: '/results/publications',
      last: true,
      alt: ' '
    }

  ];

  newsImage = {
    link: '/news',
    alt: ' ',
    imgPath: 'assets/img/home/news.jpeg'
  };

  focusSub: any;
  currentLocale: string;
  reviewDialogRef: MatDialogRef<ReviewComponent>;
  consentStatus: string;
  consentStatusSub: any;


  constructor( private searchService: SearchService, private sortService: SortService, @Inject(WINDOW) private window: Window,
               private titleService: Title, @Inject(DOCUMENT) private document: any, @Inject(PLATFORM_ID) private platformId: object,
               private cdr: ChangeDetectorRef, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService,
               private resizeService: ResizeService, public utilityService: UtilityService,
               public dialog: MatDialog, private privacyService: PrivacyService) {
                 // Capitalize first letter of locale
                this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
               }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit() {
    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
                                this.metaTags['description' + this.currentLocale],
                                this.commonTags['imgAlt' + this.currentLocale]);
    // Reset search term
    this.searchService.updateInput('');

    // Get data for count-ups
    this.getAllData();

    // Get news data
    this.searchService.getNews(10).subscribe(data => {
      this.news = data;
    });

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
      case 'sv': {
        this.setTitle('Ingångssida - Forskning.fi');
        break;
      }
    }
    this.srHeader.nativeElement.innerHTML = this.document.title.split(' - ', 1);

    this.resizeSub = this.resizeService.onResize$.subscribe(_ => this.onResize());

    // Get consent status
    if (isPlatformBrowser(this.platformId)) {
      this.consentStatusSub = this.privacyService.currentConsentStatus.subscribe(status => {
        this.consentStatus = localStorage.getItem('cookieConsent') ? localStorage.getItem('cookieConsent') : status;
      });
    }
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
    if (isPlatformBrowser(this.platformId)) {
      (this.window as any).twttr?.widgets?.load();
    }
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

  toggleReview() {
    this.reviewDialogRef = this.dialog.open(ReviewComponent, {
      maxWidth: '800px',
      minWidth: '320px',
      // minHeight: '60vh'
    });
  }


  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
    this.consentStatusSub?.unsubscribe();
  }
}
