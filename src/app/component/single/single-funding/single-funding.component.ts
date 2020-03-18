//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Inject, LOCALE_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { map } from 'rxjs/operators';
import { SearchService } from '../../../services/search.service';
import { Subscription } from 'rxjs';
import { faQuoteRight } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-single-funding',
  templateUrl: './single-funding.component.html',
  styleUrls: ['./single-funding.component.scss']
})
export class SingleFundingComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: any [];
  searchTerm: string;
  pageNumber: any;
  tab = 'fundings';

  infoFields = [
    {label: 'Lyhenne', field: 'projectAcronym'},
    {label: 'Hankkeen kuvaus', field: 'projectDescriptionFi'},
    {label: 'Aloitusvuosi', field: 'fundingStartYear'},
    {label: 'Suomen Akatemian konsortio', field: 'academyConsortium'},
    {label: 'Konsortion muut osapuolet', field: 'otherConsortium'},
  ];

  fundedFields = [
    {label: 'Nimi', field: 'fundingContactPersonLastName'},
    {label: 'Affiliaatio', field: 'fundedAffiliation'},
    {label: 'Rahoituksen saaja (organisaatio)', field: 'fundedNameFi'},
    {label: 'Rooli hankkeessa', field: 'fundingContactPersonTitle'},
    {label: 'Myönnetty summa', field: 'amount_in_EUR'},
  ];

  // TEST PURPOSES
  fundedFields2 = [
    [
      {field: 'fundingContactPersonLastName'},
      {field: ''},
      {field: 'fundingContactPersonAffiliation'}
    ],
    [
      {field: 'consortiumOrganizationNameFi'},
      {field: 'shareOfFundingInEur'},
      {field: 'contact'}
    ],
    [
      {label: 'Myönnetty summa'},
      {field: 'amount_in_EUR'}
    ]

  ];

  funderFields =  [
    {label: 'Nimi', field: 'funderNameFi'},
    {label: 'Rahoitusmuoto', field: 'typeOfFundingNameFi'},
    {label: 'Haku', field: 'callProgrammeNameFi'}
  ];

  otherFields = [
    {label: 'Tieteenala', field: 'fieldsOfScience'},
    {label: 'Tutkimusalat', field: 'fieldsOfResearch'},
    {label: 'Teema-ala', field: '?'},
    // {label: 'Avainsanat', field: 'keywords'},
    {label: 'Rahoituspäätöksen numero', field: 'funderProjectNumber'}
  ];

  linkFields = [
    {label: 'Linkit', field: 'projectHomepage'}
  ];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;

  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;

  expand: boolean;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title, @Inject(LOCALE_ID) protected localeId: string ) {
                 this.localeId = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.singleService.currentId.subscribe(id => this.getData(id));
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.searchTerm = this.searchService.singleInput;
    this.pageNumber = this.searchService.pageNumber || 1;
  }

  ngOnDestroy() {
    this.idSub.unsubscribe();
  }

  getData(id) {
    // Check if id is number, convert to -1 if string to get past elasticsearch number mapping
    const idNumber = parseInt(id, 10) ? id : -1;
    this.singleService.getSingleFunding(idNumber)
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData[0].hits.hits[0]) {
        this.setTitle(this.responseData[0].hits.hits[0]._source.projectNameFi + ' - Hankkeet - Haku - Tutkimustietovaranto');
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 1);
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
             this.responseData[0].hits.hits[0]._source[item.field] !== 'UNDEFINED' &&
             this.responseData[0].hits.hits[0]._source[item.field] !== '-1' &&
             this.responseData[0].hits.hits[0]._source[item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.fundedFields = this.fundedFields.filter(item => checkEmpty(item));
    this.funderFields = this.funderFields.filter(item => checkEmpty(item));
    this.otherFields = this.otherFields.filter(item => checkEmpty(item));
    this.linkFields = this.linkFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData[0].hits.hits[0]._source;
    const keywords = source.keywords || [];
    const scheme = keywords.map(x => x.scheme).join('');
    const field = keywords.map(x => x.keyword).join('');
    const fundingGroupPerson = source.fundingGroupPerson || [];

    source.fundingContactPersonLastName = (source.fundingContactPersonFirstNames + ' ' + source.fundingContactPersonLastName).trim();
    source.keywords = keywords.length > 0 ? keywords.map(x => x.keyword).join(', ') : undefined; // set as undefined if no keywords

    if (source.amount_in_EUR) {
      source.amount_in_EUR = this.shapeAmount(source.amount_in_EUR);
    }

    if (source.fundingGroupPerson) {
      const academyConsortium = fundingGroupPerson.filter(x => x.consortiumProject === source.funderProjectNumber);
      const otherConsortium = fundingGroupPerson.filter(x => x.consortiumProject !== source.funderProjectNumber);
      // Get Finnish Academy consortium role, found by macthing project number
      source.academyConsortium = academyConsortium[0].roleInFundingGroup;
      //Translate academy consortium role
      switch(source.academyConsortium) {
        case 'leader': {
          source.academyConsortium = {labelFi: 'Johtaja', labelEn: 'Leader'}
          break;
        }
        case 'partner': {
          source.academyConsortium = {labelFi: 'Partneri', labelEn: 'Partner'}
          break;
        }
      }
      source.academyConsortium = source.academyConsortium['label' + this.localeId]
      // Get other consortium parties, all entries that mismatch project number
      source.otherConsortium = otherConsortium.length > 0 ?
      otherConsortium.map(x => x.consortiumProject).join(', ') : null;
      // Set funded data by funderProjectNumber
      source.fundingGroupPerson = academyConsortium;
      source.fundingContactPersonAffiliation = academyConsortium[0].consortiumOrganizationNameFi;
      // Funded amount
      source.fundingGroupPerson.map(x => x.shareOfFundingInEur = this.shapeAmount(x.shareOfFundingInEur.toString()));
    }

    switch (scheme) {
      case 'Tieteenala':
        source.fieldsOfScience = field;
        break;
      case 'Tutkimusala':
        source.fieldsOfResearch = field;
        break;
      case 'Teema-ala':
        source.fieldsOfTheme = field;
        break;
    }
  }

  shapeAmount(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
