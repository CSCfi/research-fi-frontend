//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../services/single-item.service';
import { map } from 'rxjs/operators';
import { SearchService } from '../../services/search.service';
import { SettingsService } from '../../services/settings.service';
import { TabChangeService } from '../../services/tab-change.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { faTwitter, faFacebook, faLinkedin, faMendeley } from '@fortawesome/free-brands-svg-icons';
import { faQuoteRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-single-publication',
  templateUrl: './single-publication.component.html',
  styleUrls: ['./single-publication.component.scss']
})
export class SinglePublicationComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: any [];
  searchTerm: string;
  pageNumber: any;
  tab = 'publications';
  tabQueryParams: any;
  infoFields = [
    // {label: 'Julkaisun nimi', field: 'publicationName'},
    {label: 'Julkaisuvuosi', field: 'publicationYear'},
    {label: 'Julkaisutyyppi', field: 'publicationTypeCode'},
    {label: 'Tekijät', field: 'authorsText'}
  ];
  authorFields = [
    {label: 'Tekijöiden määrä', field: 'numberOfAuthors'}
  ];
  organizationFields = [
    {label: 'Organisaatio', field: 'publicationOrgId'}
  ];
  mediumFields = [
    {label: 'Lehti', field: 'journalName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'Emojulkaisun nimi', field: 'parentPublicationName', link: true, linkPath: '/results/publications/'},
    {label: 'Konferenssi', field: 'conferenceName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'Kustantaja', field: 'publisherName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'ISSN', field: 'issn', link: true, linkPath: '/results/publications/'},
    {label: 'ISBN', field: 'isbn', link: true, linkPath: '/results/publications/'},
    {label: 'Volyymi', field: 'volume', link: false},
    {label: 'Numero', field: 'issueNumber', link: false},
    {label: 'Sivut', field: 'pageNumberText', link: false},
    // \u00AD soft hyphen, break word here if needed
    {label: 'Julkaisu\u00ADfoorumi', field: 'jufoCode', link: true, linkPath: 'https://www.tsv.fi/julkaisufoorumi/haku.php?issn='},
    {label: 'Julkaisu\u00ADfoorumitaso', field: 'jufoClassCode', link: true, linkPath: '/results/publications?page=1&juFo='},
  ];

  linksFields = [
    {label: 'DOI', field: 'doi', path: 'https://doi.org/'},
    {label: 'Pysyvä osoite', field: 'doiHandle', path: ''},
    {label: 'Rinnakkaistallennus', field: 'greenOpenAccessAddress', path: ''},
  ];
  otherFields  = [
    {label: 'Tieteenalat', field: 'fieldsOfScience'},
    {label: 'Avoin saatavuus', field: 'openAccessCode'},
    {label: 'Julkaisumaa', field: 'publicationCountryCode'},
    {label: 'Kieli', field: 'languages'},
    {label: 'Kansainvälinen yhteisjulkaisu', field: 'internationalCollaboration'},
    {label: 'Yhteisjulkaisu yrityksen kanssa', field: 'businessCollaboration'},
    {label: 'Avainsanat', field: 'keywords'}
  ];

  documentLang = this.document.documentElement.lang;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  juFoCode: any;

  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faLinkedin = faLinkedin;
  faMendeley = faMendeley;
  faQuoteRight = faQuoteRight;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, public searchService: SearchService,
               private titleService: Title, private tabChangeService: TabChangeService, @Inject(DOCUMENT) private document: any,
               private settingsService: SettingsService ) {
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.singleService.currentId.subscribe(id => this.getData(id));
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.publications;
  }

  ngOnDestroy() {
    this.idSub.unsubscribe();
  }

  getData(id: string) {
    this.singleService.getSinglePublication(id)
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData[0].hits.hits[0]) {
        this.setTitle(this.responseData[0].hits.hits[0]._source.publicationName + ' - Julkaisut - Haku - Tutkimustietovaranto');
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 1);
        // juFoCode is used for exact search
        this.juFoCode = this.responseData[0].hits.hits[0]._source.jufoCode;
        this.shapeData();
        this.filterData();
      }
    },
      error => this.errorMessage = error as any);
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: {field: string} ) =>  {
      return this.responseData[0].hits.hits[0]._source[item.field] !== undefined &&
             this.responseData[0].hits.hits[0]._source[item.field] !== 'undefined' &&
             JSON.stringify(this.responseData[0].hits.hits[0]._source[item.field]) !== '["undefined"]' &&
             this.responseData[0].hits.hits[0]._source[item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.authorFields = this.authorFields.filter(item => checkEmpty(item));
    this.organizationFields = this.organizationFields.filter(item => checkEmpty(item));
    this.mediumFields = this.mediumFields.filter(item => checkEmpty(item));
    this.linksFields = this.linksFields.filter(item => checkEmpty(item));
    this.otherFields = this.otherFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData[0].hits.hits[0]._source;
    const fieldsOfScience = source.fields_of_science;
    const languages = source.languages;
    const keywords = source.keywords;
    if (fieldsOfScience && fieldsOfScience.length > 0) {
      source.fieldsOfScience = fieldsOfScience.map(x => x.nameFiScience.trim()).join(', ');
    }

    if (languages && languages.length > 0) {
      source.languages = languages.map(x => x.languageFi);
    }

    if (keywords && keywords.length > 0) {
      source.keywords = keywords.map(x => x.keyword.trim()).join(', ');
    }

    source.internationalCollaboration = source.internationalCollaboration ? 'Kyllä' : 'Ei';
    source.businessCollaboration = source.businessCollaboration ? 'Kyllä' : 'Ei';
    source.openAccessCode = source.openAccessCode > 0 ? 'Kyllä' : 'Ei';
  }

  navigate(field) {
    this.settingsService.strictFields(field);
  }
}
