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
    {label: 'Vastuuorganisaatio', field: 'responsibleOrganization'},
    {label: 'Suomen Akatemian tiekartalla', field: 'finlandRoadmap'},
    {label: 'Avainsanat', field: 'keywordsString'},
  ];

  serviceFields = [
    {label: 'Palvelun kuvaus', field: 'descriptionFi'},
    {label: 'Tieteellinen kuvaus', field: 'scientificDescription'},
    {label: 'Palvelun tyyppi', field: 'type'},
  ];

  servicePointContactFields = [
    {label: 'Kuvaus', field: 'description'},
    {label: 'Sähköpostiosoite', field: 'emailAddress'},
    {label: 'Puhelinnumero', field: 'phoneNumber'},
    {label: 'Vierailuosoite', field: 'visitingAddress'},
  ];

  servicePointInfoFields = [
    {label: 'Käyttöehdot', field: 'accessPolicyUrl'},
    {label: 'Linkki', field: 'infoUrl'},
    {label: 'Koordinoiva organisaatio', field: '?'},
  ];

  fieldsOfScience = [
    {label: 'Tieteenalat', field: '?'},
  ];

  classificationFields = [
    {label: 'Suomen Akatemian tiekartalla', field: 'finlandRoadmap'},
    {label: 'ESFRI-luokitus', field: '?'},
    {label: 'MERIL-luokitus', field: '?'},
  ];

  contactFields = [
    {label: 'Sähköpostiosoite', field: '?'},
    {label: 'Puhelinnumero', field: '?'},
    {label: 'Vierailuosoite', field: '?'},
  ];

  otherFields = [
    {label: 'Tunnisteet', field: '?'},
    {label: 'Osa kansainvälistä infrastruktuuria', field: '?'},
    {label: 'Edeltävä tutkimusinfrastruktuuri', field: '?'},
    {label: 'Lisätietoja', field: '?'},
  ];

  linkFields = [
  ];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  infoExpand: boolean[] = [];
  serviceExpand: boolean[] = [];
  showService: boolean[] = [];
  showServicePoint: boolean[][] = [];
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
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
  }

  getData(id: string) {
    this.singleService.getSingleInfrastructure(id)
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData.infrastructures[0]) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(this.responseData.infrastructures[0].nameFi + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.infrastructures[0].nameFi + ' - Research.fi'); // English name??
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
             this.responseData.infrastructures[0][item.field] !== '0' &&
             this.responseData.infrastructures[0][item.field] !== null &&
             this.responseData.infrastructures[0][item.field] !== '' &&
             this.responseData.infrastructures[0][item.field] !== ' ' &&
             this.responseData.infrastructures[0][item.field] !== '#N/A';
    };

    const isNull = (obj) => Object.values(obj).every(x => (x === null));
    // Check if every field null in service points and set flag. This is used to hide service from list
    this.responseData.infrastructures[0].services.forEach(item => {

      if (item.servicePoints.every(isNull)) {
        const hideFlag = 'hide';
        item.servicePoints[hideFlag] = 'true';
      }
    });
    // Filter out invalid services
    this.responseData.infrastructures[0].services = this.responseData.infrastructures[0].services.filter(
      item => item.name !== '0' && item.name !== '#N/A');

    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.fieldsOfScience = this.fieldsOfScience.filter(item => checkEmpty(item));
    this.classificationFields = this.classificationFields.filter(item => checkEmpty(item));
    this.contactFields = this.contactFields.filter(item => checkEmpty(item));
    this.otherFields = this.otherFields.filter(item => checkEmpty(item));

    // Init expand and show lists
    this.infoFields.forEach(_ => this.infoExpand.push(false));
    this.serviceFields.forEach(_ => this.serviceExpand.push(false));
    this.responseData.infrastructures[0].services.forEach((service, idx) => {
      this.showService.push(false);
      this.showServicePoint.push([]);
      service.servicePoints.forEach(_ => this.showServicePoint[idx].push(false));
    });
  }

  shapeData() {
    const source = this.responseData.infrastructures[0];
    source.finlandRoadmap = source.finlandRoadmap ? 'Kyllä' : 'Ei';
  }

  expandInfoDescription(idx: number) {
    this.infoExpand[idx] = !this.infoExpand[idx];
  }

  expandServiceDescription(idx: number) {
    this.serviceExpand[idx] = !this.serviceExpand[idx];
  }

  toggleService(idx: number) {
    this.showService[idx] = !this.showService[idx];
  }

  toggleServicePoint(service: number, point: number) {
    this.showServicePoint[service][point] = !this.showServicePoint[service][point];
  }

  serviceExpandId(serviceId: number, fieldId: number) {
    return this.serviceFields.length * serviceId + fieldId;
  }
}
