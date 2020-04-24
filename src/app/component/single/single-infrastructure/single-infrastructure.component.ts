//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { SearchService } from '../../../services/search.service';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { Subscription } from 'rxjs';
import { Search } from 'src/app/models/search.model';
import { TabChangeService } from 'src/app/services/tab-change.service';

@Component({
  selector: 'app-single-infrastructure',
  templateUrl: './single-infrastructure.component.html',
  styleUrls: ['./single-infrastructure.component.scss']
})
export class SingleInfrastructureComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;

  tab = 'infrastructures';
  infoFields = [
    {label: 'Lyhenne', field: 'acronym'},
    {label: 'Infrastruktuurin kuvaus', field: 'description'},
    {label: 'Tieteellinen kuvaus', field: 'scientificDescription'},
    {label: 'Toiminta alkanut', field: 'startYear'},
    {label: 'Toiminta päättynyt', field: 'endYear'},
    {label: 'Vastuuorganisaatio', field: 'responsibleOrganizationNameFi'},
    {label: 'Avainsanat', field: 'keywordsString'},
  ];

  studentCounts = [
    {label: 'Nimi', field: 'name'},
  ];

  subUnitFields = [
    {label: 'Nimi', field: 'name'},
  ];

  linkFields = [
  ];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  expand: boolean[] = [];
  faIcon = faFileAlt;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title, private tabChangeService: TabChangeService, @Inject(LOCALE_ID) protected localeId: string) {
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.singleService.currentId.subscribe(id => this.getData(id));
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.infrastructures;
    this.searchTerm = this.searchService.singleInput;
    this.infoFields.forEach(_ => this.expand.push(false));
  }

  ngOnDestroy() {
    this.idSub.unsubscribe();
  }

  getData(id: string) {
    this.singleService.getSingleInfrastructure(id)
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData.infrastructures[0]) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(this.responseData.infrastructures[0].name + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.infrastructures[0].name + ' - Research.fi'); // English name??
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
      return this.responseData.infrastructures[0][item.field] !== undefined &&
             this.responseData.infrastructures[0][item.field] !== 0 &&
             this.responseData.infrastructures[0][item.field] !== null &&
             this.responseData.infrastructures[0][item.field] !== '' &&
             this.responseData.infrastructures[0][item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.studentCounts = this.studentCounts.filter(item => checkEmpty(item));
    this.subUnitFields = this.subUnitFields.filter(item => checkEmpty(item));
  }

  shapeData() {
  }

  expandDescription(idx: number) {
    this.expand[idx] = !this.expand[idx];
  }
}
