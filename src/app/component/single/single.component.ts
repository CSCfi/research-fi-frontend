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
import { Location } from '@angular/common';

@Component({
  selector: 'app-single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.scss']
})
export class SingleComponent implements OnInit {
  public singleId: any;
  responseData: any [];
  infoFields = [
    {label: 'Julkaisun nimi', field: 'publicationName'},
    {label: 'Tekijät', field: 'authorsText'},
    {label: 'Julkaisuvuosi', field: 'publicationYear'},
    {label: 'Julkaisutyyppi', field: 'publicationTypeCode'}
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
    {label: 'Julkaisufoorumi', field: 'jufoCode'},
    {label: 'Julkaisufoorumitaso', field: 'jufoClassCode'}
  ];
  linksFields = [
    {label: 'Juuli', field: 'juuliAddress'}
  ];
  otherFields  = [
    {label: 'Tieteenalat', field: 'fields_of_science'},
    {label: 'Avoin saatavuus', field: 'openAccessCode'},
    {label: 'Julkaisumaa', field: 'publicationCountryCode'},
    {label: 'Kieli', field: 'languageCode'},
    {label: 'Kansainvälinen yhteisjulkaisu', field: 'internationalCollaboration'},
    {label: 'Yhteisjulkaisu yrityksen kanssa', field: 'businessCollaboration'}
  ];
  errorMessage = [];
  @ViewChild('srHeader') srHeader: ElementRef;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private titleService: Title,
               private location: Location ) {
    this.singleId = this.route.snapshot.params.id;
    this.singleService.getId(this.singleId);
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.getData();
  }

  navigateBack() {
    this.location.back();
  }

  getData() {
    this.singleService.getSingle()
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      this.setTitle(this.responseData[0].hits.hits[0]._source.publicationName + ' - Julkaisut - Haku - Tutkimustietovaranto');
      this.srHeader.nativeElement.innerHTML = document.title.split(' - ', 1);
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
}
