//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Inject, LOCALE_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { SearchService } from '../../../services/search.service';
import { Title } from '@angular/platform-browser';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

@Component({
  selector: 'app-single-organization',
  templateUrl: './single-organization.component.html',
  styleUrls: ['./single-organization.component.scss']
})
export class SingleOrganizationComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: any;
  searchTerm: string;
  pageNumber: any;
  tab = 'organizations';
  infoFields = [
    {label: 'Nimi (SV, EN)', field: 'nameSv', fieldEn: 'nameEn'},
    {label: 'Muut nimet', field: 'variantNames'},
    {label: 'Perustettu', field: 'established'},
    {label: 'Lisätietoa', field: 'organizationBackground'},
    {label: 'Edeltävä organisaatio', field: 'predecessors'},
    {label: 'Liittyvä organisaatio', field: 'related'},
    {label: 'Organisaatiomuoto', field: 'organizationType'},
    {label: 'Organisaation tyyppi', field: 'sectorNameFi'},
    {label: 'Käyntiosoite', field: 'visitingAddress'},
    {label: 'Postiosoite', field: 'postalAddress'},
    {label: 'Y-tunnus', field: 'businessId'},
    {label: 'Tilastokeskuksen oppilaitostunnus', field: '01910'},
    {label: 'Opetus- ja tutkimushenkilöstön määrä (htv)', field: 'staffCountAsFte'},
  ];

  studentCounts = [
    {label: 'Alempi korkeakoulututkinto', field: 'thesisCountBsc'},
    {label: 'Ylempi korkeakoulututkinto', field: 'thesisCountMsc'},
    {label: 'Lisensiaatintutkinto', field: 'thesisCountLic'},
    {label: 'Tohtorintutkinto', field: 'thesisCountPhd'}
  ];

  subUnitFields = [
    {label: 'Alayksiköt', field: 'subUnits'}
  ];

  linkFields = [
    {label: 'Linkit', field: 'homepage'}
  ];

  relatedList = [
    {labelFi: 'Julkaisut', tab: 'publications', disabled: false},
    {labelFi: 'Tutkijat', tab: 'persons', disabled: true},
    {labelFi: 'Aineistot', tab: '', disabled: true},
    {labelFi: 'Infrastruktuurit', tab: 'infrastructures', disabled: true},
    {labelFi: 'Muu tutkimustoiminta', tab: '', disabled: true},
  ]

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  expand: boolean;
  latestSubUnitYear: string;
  faIcon = faFileAlt;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title, @Inject(LOCALE_ID) protected localeId: string ) {
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.singleService.currentId.subscribe(id => {
      this.getData(id);
    });
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.searchTerm = this.searchService.singleInput;
    this.pageNumber = this.searchService.pageNumber || 1;
  }

  ngOnDestroy() {
    this.idSub.unsubscribe();
  }

  getData(id: string) {
    this.singleService.getSingleOrganization(id)
    // .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData.organizations[0]) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(this.responseData.organizations[0].nameFi + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.organizations[0].nameEn.trim() + ' - Research.fi');
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
      return this.responseData.organizations[0][item.field] !== undefined &&
             this.responseData.organizations[0][item.field] !== 0 &&
             this.responseData.organizations[0][item.field] !== null &&
             this.responseData.organizations[0][item.field] !== '' &&
             this.responseData.organizations[0][item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.studentCounts = this.studentCounts.filter(item => checkEmpty(item));
    this.subUnitFields = this.subUnitFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData.organizations[0];
    const locale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    // const predecessors = source.predecessors;
    // const related = source.related;
    let subUnits = source.subUnits;

    // if (predecessors && predecessors.length > 0) {
    //   source.predecessors = predecessors.map(x => x.nameFi.trim()).join(', ');
    // }

    // if (related && related.length > 0) {
    //   source.related = related.map(x => x.nameFi.trim()).join(', ');
    // }

    if (subUnits && subUnits.length > 0) {
      // Get latest year of subUnits. Data is in string format
      const subUnitYears = [...new Set(subUnits.map(item => item.year))];
      const transformedYears = subUnitYears.map(Number);
      this.latestSubUnitYear = (Math.max(...transformedYears)).toString();
      // Get results that match the yeat
      subUnits = subUnits.filter((item) => {
        return Object.keys(item).some((key) => item[key].includes(this.latestSubUnitYear));
      });
      // List items
      source.subUnits = subUnits.map(x => x.subUnitName.trim()).join(', ');
    }
  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
