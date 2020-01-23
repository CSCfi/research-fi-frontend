//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../services/single-item.service';
import { map } from 'rxjs/operators';
import { SearchService } from '../../services/search.service';
import { Subscription } from 'rxjs';
import { faTwitter, faFacebook, faLinkedin, faMendeley } from '@fortawesome/free-brands-svg-icons';
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
    {label: 'Konsortion muut osapuolet', field: 'consortiumParties'},
  ];

  fundedFields = [
    {label: 'Sukunimi', field: 'fundingContactPersonLastName'},
    {label: 'Affiliaatio', field: 'fundedAffiliation'},
    {label: 'Rahoituksen saaja (organisaatio)', field: 'fundedNameFi'},
    {label: 'Rooli hankkeessa', field: 'fundingContactPersonTitle'},
    {label: 'Myönnetty summa', field: 'amount_in_EUR'},
  ];

  // TEST PURPOSES
  fundedFields2 = [
    [{field: 'fundingContactPersonLastName'}, {field: 'fundedAffiliation'}],
    [{field: 'orgName'}, {field: 'role'}, {field: 'amount'}, {field: 'contact'}],
    [{label: 'Myönnetty summa'}, {field: 'amount_in_EUR'}]

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
    {label: 'Muut tiedot', field: '?'}
  ];

  linkFields = [
    {label: 'Linkit', field: 'projectHomepage'}
  ];

  // TEST PURPOSES
  testData = [{
    took: 79,
    timed_out: false,
    _shards: {
      total: 5,
      successful: 5,
      skipped: 0,
      failed: 0
    },
    hits: {
      total: 1,
      max_score: 1.0,
      hits: [
        {
          _index: 'funding',
          _type: 'document',
          _id: '672732',
          _score: 1.0,
          _source: {
            amount_in_EUR: 50000,
            funderOrganizationId: ' ',
            funderLocalOrganizationUnitId: ' ',
            funderOrganizationType: ' ',
            funderBusinessId: ' ',
            funderNameFi: 'Rahoitusyhtiö Korkokatto',
            funderNameSv: ' ',
            funderNameEn: ' ',
            funderHomepage: ' ',
            projectId: 16786,
            projectAcronym: 'IRIS-1',
            projectNameFi: 'IRIS Feasibility Study – Phase 1',
            projectDescriptionFi: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
            projectHomepage: 'http://rinicare.com/randd/rinicare/rinicare-stability/',
            funderSectorId: ' ',
            funderSectorNameFi: ' ',
            funderSectorNameEn: ' ',
            funderSectorNameSv: ' ',
            typeOfFundingId: 'SME-1',
            typeOfFundingNameFi: 'SME instrument phase 1',
            callProgrammeNameUnd: ' ',
            callProgrammeNameFi: 'Hakuohjelma 2020',
            callProgrammeNameSv: ' ',
            callProgrammeNameEn: ' ',
            callProgrammeHomepage: ' ',
            callDueDate: ' ',
            callDate: ' ',
            fundingApprovalDate: '2015-05-01',
            fundingStartYear: 2015,
            fundingEndDate: '2015-10-31',
            fundingContactPersonLastName: 'Sukunimi',
            fundingContactPersonFirstNames: 'Etunimi',
            fundingContactPersonOrcid: '012345',
            fundingContactPersonJobRole: ' ',
            fundingContactPersonTitle: 'Tutkija',
            fundingContactPersonNationality: ' ',
            fundingContactPersonGender: ' ',
            countryId: ' ',
            regionId: ' ',
            municipalityId: ' ',
            countryFi: ' ',
            countryEn: ' ',
            countrySv: ' ',
            regionFi: ' ',
            regionSv: ' ',
            municipalityFi: ' ',
            municipalitySv: ' ',
            academyConsortium: 'Suomen akatemian konsortion nimi',
            consortiumParties: [
              {party: ''},
              {party: 'Osapuoli 2'},
            ],
            funded: [
              {fundedName: 'Saaja Henkilö'},
              {org: ''}
            ],
            fundedAffiliation: 'Testiaffiliaatio',
            fundedNameFi: 'Organisaatio',
            fundedOrgs: [
              {orgName: 'Visma', role: 'Tutkija', amount: '45000', contact: 'Joku Nimi'},
              {orgName: 'VR', role: 'Junakuski', amount: '15000', contact: 'Marko Messevä'},
            ]
          }
        }
      ]
    }
  }];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;

  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faLinkedin = faLinkedin;
  faMendeley = faMendeley;
  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;

  expand: boolean;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title ) {
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
      // TEST PURPOSES
      // this.responseData = this.testData;
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
    const consortiumParties = source.consortiumParties || [];

    source.keywords = keywords.length > 0 ? keywords.map(x => x.keyword).join(', ') : undefined; // set as undefined if no keywords

    if (source.amount_in_EUR) {
      source.amount_in_EUR = source.amount_in_EUR + '€';
    }

    if (source.fundedOrgs) {
      source.fundedOrgs.map(x => x.amount = x.amount + '€');
    }

    source.consortiumParties = consortiumParties && consortiumParties.length > 0 ?
    this.singleService.joinEntries(consortiumParties, 'party') : source.consortiumParties;

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
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
