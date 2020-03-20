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
import { Search } from 'src/app/models/search.model';

@Component({
  selector: 'app-single-funding',
  templateUrl: './single-funding.component.html',
  styleUrls: ['./single-funding.component.scss']
})
export class SingleFundingComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tab = 'fundings';

  infoFields = [
    {label: 'Lyhenne', field: 'projectAcronym'},
    {label: 'Hankkeen kuvaus', field: 'descriptionFi'},
    {label: 'Aloitusvuosi', field: 'startYear'},
  ];

  fundedFields = [
    {label: 'Nimi', field: 'personName'},
    {label: 'Affiliaatio', field: 'affiliation'},
    {label: 'Rahoituksen saaja (organisaatio)', field: 'organizationName'},
    {label: 'Rooli hankkeessa', field: 'fundingContactPersonTitle'},
    {label: 'Myönnetty summa', field: 'amountEur'},
  ];

  // TEST PURPOSES
  fundedFields2 = [
    [
      {field: 'personName'},
      {field: ''},
      {field: 'affiliation'}
    ],
    [
      {field: 'organizationName'},
      {field: 'shareOfFundingEur'},
      {field: 'contactPersonName'}
    ],
    [
      {label: 'Myönnetty summa'},
      {field: 'amountEur'}
    ]

  ];

  funderFields =  [
    {label: 'Nimi', field: 'nameFi'},
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
    // .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData.fundings[0]) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(this.responseData.fundings[0].nameFi + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.fundings[0].nameEn + ' - Research.fi');
            break;
          }
        }
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
      return this.responseData.fundings[0][item.field] !== undefined &&
             this.responseData.fundings[0][item.field] !== 'UNDEFINED' &&
             this.responseData.fundings[0][item.field] !== '-1' &&
             this.responseData.fundings[0][item.field] !== '' &&
             this.responseData.fundings[0][item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.fundedFields = this.fundedFields.filter(item => checkEmpty(item));
    // this.funderFields = this.funderFields.filter(item => checkEmpty(item));
    this.otherFields = this.otherFields.filter(item => checkEmpty(item));
    this.linkFields = this.linkFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData.fundings[0];
    const locale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);

    // Get label by locale
    source.academyConsortium = source.academyConsortium ? source?.academyConsortium['label' + locale] : '';

    // Map consortiums to their ids
    source.otherConsortium = source.otherConsortium.map(x => x.consortiumProject);

  }

  shapeAmount(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
