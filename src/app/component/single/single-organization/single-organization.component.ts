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
import { TabChangeService } from 'src/app/services/tab-change.service';
import { UtilityService } from 'src/app/services/utility.service';

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
  tabQueryParams: any;

  tab = 'organizations';
  infoFields = [
    {label: $localize`:@@orgName:Nimi (SV, EN)`, field: 'nameSv', fieldEn: 'nameEn'},
    {label: $localize`:@@orgOtherNames:Muut nimet`, field: 'variantNames', tooltip: $localize`:@@fintoSource:Lähde: Finto www.finto.fi/cn/fi/`},
    {label: $localize`:@@orgEstablished:Perustettu`, field: 'established', tooltip: $localize`:@@fintoSource:Lähde: Finto www.finto.fi/cn/fi/`},
    {label: $localize`:@@orgBackground:Lisätietoa`, field: 'background', tooltip: $localize`:@@fintoSource:Lähde: Finto www.finto.fi/cn/fi/`},
    {label: $localize`:@@orgPredecessor:Edeltävä organisaatio`, field: 'predecessors', tooltip: $localize`:@@fintoSource:Lähde: Finto www.finto.fi/cn/fi/`},
    {label: $localize`:@@orgRelated:Liittyvä organisaatio`, field: 'related', tooltip: $localize`:@@fintoSource:Lähde: Finto www.finto.fi/cn/fi/`},
    {label: $localize`:@@orgType:Organisaatiomuoto`, field: 'organizationType', tooltip: $localize`:@@yyjSource:Lähde: Yritys- ja yhteisötietojärjestelmä YTJ https://tietopalvelu.ytj.fi/`},
    {label: $localize`:@@orgSector:Organisaation tyyppi`, field: 'sectorNameFi', tooltip: $localize`:@@yyjSource:Lähde: Yritys- ja yhteisötietojärjestelmä YTJ https://tietopalvelu.ytj.fi/`},
    {label: $localize`:@@orgVAddress:Käyntiosoite`, field: 'visitingAddress', tooltip: $localize`:@@yyjSource:Lähde: Yritys- ja yhteisötietojärjestelmä YTJ https://tietopalvelu.ytj.fi/`},
    {label: $localize`:@@orgAddress:Postiosoite`, field: 'postalAddress', tooltip: $localize`:@@yyjSource:Lähde: Yritys- ja yhteisötietojärjestelmä YTJ https://tietopalvelu.ytj.fi/`},
    {label: $localize`:@@orgBID:Y-tunnus`, field: 'businessId', tooltip: $localize`:@@yyjSource:Lähde: Yritys- ja yhteisötietojärjestelmä YTJ https://tietopalvelu.ytj.fi/`},
    {label: $localize`:@@orgSTID:Tilastokeskuksen oppilaitostunnus`, field: 'statCenterId', tooltip: $localize`:@@tkSource:Lähde: Tilastokeskus`},
    {label: $localize`:@@orgStaffCount:Opetus- ja tutkimushenkilöstön määrä (htv)`, field: 'staffCountAsFte', tooltip: $localize`:@@vipunenSource:Lähde: Vipunen – opetushallinnon tilastopalvelu www.vipunen.fi`},
  ];

  studentCounts = [
    {label: $localize`:@@orgThesisCountBsc:Alempi korkeakoulututkinto`, field: 'thesisCountBsc'},
    {label: $localize`:@@orgThesisCountMsc:Ylempi korkeakoulututkinto`, field: 'thesisCountMsc'},
    {label: $localize`:@@orgThesisCountLic:Lisensiaatintutkinto`, field: 'thesisCountLic'},
    {label: $localize`:@@orgThesisCountPhd:Tohtorintutkinto`, field: 'thesisCountPhd'}
  ];

  subUnitFields = [
    {label: $localize`:@@orgSubUnits:Alayksiköt`, field: 'subUnits', tooltip: $localize`:@@vipunenSource:Lähde: Vipunen – opetushallinnon tilastopalvelu www.vipunen.fi`}
  ];

  linkFields = [
    {label: $localize`:@@links:Linkit`, field: 'homepage'}
  ];

  relatedList = [
    {labelFi: $localize`:@@publications:Julkaisut`, tab: 'publications', disabled: false},
    {labelFi: $localize`:@@authors:Tutkijat`, tab: 'persons', disabled: true},
    {labelFi: $localize`:@@materials:Aineistot`, tab: '', disabled: true},
    {labelFi: $localize`:@@infrastructures:Infrastruktuurit`, tab: 'infrastructures', disabled: true},
    {labelFi: $localize`:@@otherResearchActivity:Muu tutkimustoiminta`, tab: '', disabled: true},
  ];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  expand: boolean;
  latestSubUnitYear: string;
  faIcon = faFileAlt;
  subUnitSlice = 10;
  currentLocale: string;
  tabData: any;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService,
               public utilityService: UtilityService ) {
                 // Capitalize first letter of locale
                this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
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
    this.tabQueryParams = this.tabChangeService.tabQueryParams.organizations;
    this.tabData = this.tabChangeService.tabData.find(item => item.data === 'organizations');
    this.searchTerm = this.searchService.singleInput;
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
  }

  getData(id: string) {
    this.singleService.getSingleOrganization(id)
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData.organizations[0]) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(this.responseData.organizations[0].name + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.organizations[0].name.trim() + ' - Research.fi');
            break;
          }
          case 'sv': {
            this.setTitle(this.responseData.organizations[0].name.trim() + ' - Forskning.fi');
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
      return UtilityService.stringHasContent(this.responseData.organizations[0][item.field]);
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.studentCounts = this.studentCounts.filter(item => checkEmpty(item));
    this.subUnitFields = this.subUnitFields.filter(item => checkEmpty(item));
    this.linkFields = this.linkFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData.organizations[0];
    const locale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);

    const subUnits = source.subUnits;

    if (!(source.sectorNameFi === 'Ammattikorkeakoulu') && !(source.sectorNameFi === 'Yliopisto')) {
      source.statCenterId = '';
    }

    if (subUnits && subUnits.length > 0) {
      // Get latest year of subUnits. Data is in string format
      const subUnitYears = [...new Set(subUnits.map(item => item.year))];
      const transformedYears = subUnitYears.map(Number);
      this.latestSubUnitYear = (Math.max(...transformedYears)).toString();
      source.subUnits = source.subUnits.filter(item => item.year === this.latestSubUnitYear);
      // Sort sub units by name
      source.subUnits.sort((a,b) => {
          const x = a.subUnitName.toLowerCase();
          const y = b.subUnitName.toLowerCase();
          return x < y ? -1 : x > y ? 1 : 0;
      });
    }
  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
