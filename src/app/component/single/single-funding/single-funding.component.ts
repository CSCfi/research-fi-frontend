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
import { TabChangeService } from 'src/app/services/tab-change.service';

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
  tabQueryParams: any;
  tab = 'fundings';

  info = [
    {label: 'Akronyymi', field: 'acronym'},
    {label: 'Hankkeen kuvaus', field: 'descriptionFi', tooltipFi: 'Kuvaus kertoo tiiviisti hankkeen tavoitteesta'},
    {label: 'Aloitusvuosi', field: 'startYear', tooltipFi: 'Vuosi, jolle rahoitus on myönnetty. Useampivuotisissa rahoituksissa ensimmäinen vuosi.'},
    {label: 'Päättymisvuosi', field: 'endYear', tooltipFi: 'Rahoituskauden päättymisvuosi.'},
  ];

  funded = [
    {label: 'Nimi', field: 'personName'},
    {label: 'Affiliaatio', field: 'affiliation'},
    {label: 'Rahoituksen saaja (organisaatio)', field: 'organizationName'},
    {label: 'Rooli hankkeessa', field: 'fundingContactPersonTitle'},
    {label: 'Myönnetty summa', field: 'amountEur'},
  ];

  funder =  [
    // {label: 'Nimi', field: 'nameFi'},
    {label: 'Rahoitusmuoto', field: 'typeOfFundingName', tooltipFi: 'Tapa rahoittaa tutkimusta. Rahoitusmuotoja ovat esimerkiksi tutkimusapuraha, hankerahoitus ja tutkimusinfrastruktuurirahoitus. Rahoitusmuodot ovat usein rahoittajakohtaisia.'},
    {label: 'Haku', field: 'callProgrammeName', tooltipFi: 'Rahoittajan haku, josta rahoitus on myönnetty. Kilpailtu tutkimusrahoitus myönnetään usein avoimien hakujen kautta, joissa rahoituksen myöntämisen perusteena ovat ennalta määrätyt kriteerit. Hakemukset arvioidaan ja rahoitus myönnetään kriteerien ja muiden tavoitteiden perusteella parhaiksi katsotuille hakemuksille.'}
  ];

  other = [
    {label: 'Rahoituspäätöksen numero', field: 'funderProjectNumber'},
    {label: 'Tieteenalat', field: 'fieldsOfScience'},
    {label: 'Tutkimusalat', field: 'fieldsOfResearch'},
    {label: 'Teema-alat', field: 'fieldsOfTheme'},
    {label: 'Hankkeen verkkosivu', field: '?'},
    // {label: 'Avainsanat', field: 'keywords'},
  ];

  link = [
    {label: 'Linkit', field: 'projectHomepage'}
  ];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;

  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;

  expand: boolean;
  infoFields: any[];
  fundedFields: any[];
  otherFields: any[];
  linkFields: any[];
  funderFields: ({ label: string; field: string; tooltipFi?: undefined; } | { label: string; field: string; tooltipFi: string; })[];

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService ) {
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.route.params.subscribe(params => {
      this.getData(params.id);
    });
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.fundings;
    this.searchTerm = this.searchService.singleInput;
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
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

    const checkNestedEmpty = (parent: string, item: {field: string} ) =>  {
      return this.responseData.fundings[0][parent][item.field] !== undefined &&
             this.responseData.fundings[0][parent][item.field] !== 'UNDEFINED' &&
             this.responseData.fundings[0][parent][item.field] !== '-1' &&
             this.responseData.fundings[0][parent][item.field] !== '' &&
             this.responseData.fundings[0][parent][item.field] !== ' ';
    };

    // Filter all the fields to only include properties with defined data
    this.infoFields = Object.assign(this.info.filter(item => checkEmpty(item)));
    this.fundedFields = Object.assign(this.funded.filter(item => checkEmpty(item)));
    this.otherFields = Object.assign(this.other.filter(item => checkEmpty(item)));
    this.linkFields = Object.assign(this.link.filter(item => checkEmpty(item)));
    // Same for nested fields
    this.funderFields = Object.assign(this.funder.filter(item => checkNestedEmpty('funder', item)));
    // Filter out empty organization names
    this.responseData.fundings[0].recipient.organizations = this.responseData.fundings[0].recipient.organizations.filter(item =>
      item.nameFi !== '' && item.nameFi !== null);
  }

  shapeData() {
    const source = this.responseData.fundings[0];
    const locale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);

    // Get label by locale
    source.academyConsortium = source.academyConsortium ? source?.academyConsortium['label' + locale] : '';
  }

  shapeAmount(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
