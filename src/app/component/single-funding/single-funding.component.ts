//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from 'src/app/services/single-item.service';
import { map } from 'rxjs/operators';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-single-funding',
  templateUrl: './single-funding.component.html',
  styleUrls: ['./single-funding.component.scss']
})
export class SingleFundingComponent implements OnInit {
  public singleId: any;
  responseData: any [];
  searchTerm: string;
  pageNumber: any;
  infoFields = [
    {label: 'Hankkeen nimi', field: 'projectNameFi'},
    {label: 'Rahoittaja', field: 'funderNameFi'},
    {label: 'Hankkeen kuvaus', field: 'projectDescriptionFi'},
    {label: 'Alkamisvuosi', field: 'fundingApprovalDate'},
    {label: 'Rahoituksen saaja (organisaatio)', field: 'fundedNameFi'},
    {label: 'Rahoituksen saaja (henkilö)', field: 'projectPersonsNames'},
    {label: 'Yhteyshenkilö', field: 'fundingContactPersonLastName'},
    {label: 'Muut organisaatiot', field: '?'},
    {label: 'Myönnetty summa', field: 'amount'},
    {label: 'Rahoitusmuoto', field: '?'},
    {label: 'Konsortion nimi', field: 'consortiumNameFi'},
    {label: 'Konsortion kuvaus', field: 'consortiumDescriptionFi'},
    {label: 'Hankkeeseen liittyvät muut rahoituspäätökset', field: '?'},
    {label: 'Hankkeen alkupvm', field: 'fundingApprovalDate'},
    {label: 'Hankkeen loppupvm', field: '?'},
    {label: 'Tieteenala', field: 'keyword'},
    {label: 'Teema-alat / tutkimusalat', field: 'keyword'},
    {label: 'Avainsanat', field: 'keywords'},
    {label: 'Haun nimi', field: 'callProgrammeNameFi'},
    {label: 'Linkit', field: '?'},
    {label: 'Muut tiedot', field: '?'},
  ];

  errorMessage = [];
  @ViewChild('srHeader') srHeader: ElementRef;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title ) {
    this.singleId = this.route.snapshot.params.id;
    this.singleService.getFundingId(this.singleId);
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
    this.singleService.getSingleFunding()
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      this.setTitle(this.responseData[0].hits.hits[0]._source.projectNameFi + ' - Hankkeet - Haku - Tutkimustietovaranto');
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
  }

  shapeData() {
    const source = this.responseData[0].hits.hits[0]._source;
    const persons = source.projectPersons;
    const keywords = source.keywords;
    if (source.amount) {
      source.amount = source.amount + '€';
    }
    if (persons && persons.length > 0) {
      source.projectPersonsNames = persons[0].projectPersonFirstNames + ' ' + persons[0].projectPersonLastName;
    }
    if (keywords && keywords.length > 0) {
      source.keyword = keywords[0].keyword;
      source.scheme = keywords[0].scheme;
      source.language = keywords[0].language;
      source.keywords = source.keyword + ' ' + source.scheme + ' ' + source.language;
    }
  }
}
