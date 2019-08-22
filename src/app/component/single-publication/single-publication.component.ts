//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../services/single-item.service';
import { map } from 'rxjs/operators';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-single-publication',
  templateUrl: './single-publication.component.html',
  styleUrls: ['./single-publication.component.scss']
})
export class SinglePublicationComponent implements OnInit {
  public singleId: any;
  responseData: any [];
  searchTerm: string;
  pageNumber: any;
  tab = 'publications';
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
    {label: 'Lehti', field: 'publisherName'},
    {label: 'ISSN', field: 'issn'},
    {label: 'ISBN', field: 'isbn'},
    {label: 'Volyymi', field: 'volume'},
    {label: 'Numero', field: 'issueNumber'},
    {label: 'Sivut', field: 'pageNumberText'},
    {label: 'Julkaisu\u00ADfoorumi', field: 'jufoCode'}, // \u00AD soft hyphen, break word here if needed
    {label: 'Julkaisu\u00ADfoorumitaso', field: 'jufoClassCode'}
  ];
  linksFields = [
    {label: 'DOI', field: 'doiHandle'},
    {label: 'Rinnakkaistallennus', field: 'greenOpenAccessAddress'},
  ];
  otherFields  = [
    {label: 'Tieteenalat', field: 'fieldsOfScience'},
    {label: 'Avoin saatavuus', field: 'openAccessCode'},
    {label: 'Julkaisumaa', field: 'publicationCountryCode'},
    {label: 'Kieli', field: 'languageCode'},
    {label: 'Kansainvälinen yhteisjulkaisu', field: 'internationalCollaboration'},
    {label: 'Yhteisjulkaisu yrityksen kanssa', field: 'businessCollaboration'}
  ];

  errorMessage = [];
  @ViewChild('srHeader') srHeader: ElementRef;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title ) {
    this.singleId = this.route.snapshot.params.id;
    this.singleService.getPublicationId(this.singleId);
    this.searchTerm = this.searchService.singleInput;
    this.pageNumber = this.searchService.pageNumber || 1;
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.singleService.getSinglePublication()
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      this.setTitle(this.responseData[0].hits.hits[0]._source.publicationName + ' - Julkaisut - Haku - Tutkimustietovaranto');
      this.srHeader.nativeElement.innerHTML = document.title.split(' - ', 1);
      this.shapeData();
      this.filterData();
    },
      error => this.errorMessage = error as any);
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: {field: string} ) =>  {
      return this.responseData[0].hits.hits[0]._source[item.field] !== undefined &&
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
    if (fieldsOfScience && fieldsOfScience.length > 0) {
      source.fieldsOfScience = fieldsOfScience.map(x => x.nameFiScience.trim()).join(', ');
    }

    source.internationalCollaboration = source.internationalCollaboration ? 'Kyllä' : 'Ei';
    source.businessCollaboration = source.businessCollaboration ? 'Kyllä' : 'Ei';
    source.openAccessCode = source.openAccessCode > 0 ? 'Kyllä' : 'Ei';

    switch (source.languageCode) {
      case 'fi': {
        source.languageCode = 'suomi';
        break;
      }
      case 'en': {
        source.languageCode = 'englanti';
        break;
      }
      case 'se': {
        source.languageCode = 'ruotsi';
        break;
      }
    }
  }
}
