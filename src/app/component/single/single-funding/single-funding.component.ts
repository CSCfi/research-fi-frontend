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
import { UtilityService } from 'src/app/services/utility.service';

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
    {label: $localize`Akronyymi`, field: 'acronym'},
    {label: $localize`Hankkeen kuvaus`, field: 'description', tooltip: 'Kuvaus kertoo tiiviisti hankkeen tavoitteesta', tooltipEn: 'Concise description of the project objective', tooltipSV: 'Beskrivningen anger kortfattat projektets mål'},
    {label: $localize`Aloitusvuosi`, field: 'startYear', tooltip: 'Vuosi, jolle rahoitus on myönnetty. Useampivuotisissa rahoituksissa ensimmäinen vuosi.', tooltipEn: 'Year for which funding was granted. In funding covering several years, the first year of funding.', tooltipSv: 'År för vilket finansiering har beviljats. Det första året i finansiering för flera år.'},
    {label: $localize`Päättymisvuosi`, field: 'endYear', tooltip: 'Rahoituskauden päättymisvuosi.'},
  ];

  funder =  [
    {label: $localize`Rahoitusmuoto`, labelSv: 'Typ av finansiering', field: 'typeOfFundingName', tooltip: 'Tapa rahoittaa tutkimusta. Rahoitusmuotoja ovat esimerkiksi tutkimusapuraha, hankerahoitus ja tutkimusinfrastruktuurirahoitus. Rahoitusmuodot ovat usein rahoittajakohtaisia.', tooltipEn: 'Method of funding research. Instruments of funding include research grants, project funding and research infrastructure funding. Instruments are often specific to each funder.', tooltipSv: 'Sätt att finansiera forskning. Typer av finansiering är till exempel forskningsbidrag, projektfinansiering och forskningsinfrastrukturfinansiering. Finansieringstyper är ofta finansiärspecifika.'},
    {label: $localize`Haku`, field: 'callProgrammeName', tooltip: 'Rahoittajan haku, josta rahoitus on myönnetty. Kilpailtu tutkimusrahoitus myönnetään usein avoimien hakujen kautta, joissa rahoituksen myöntämisen perusteena ovat ennalta määrätyt kriteerit. Hakemukset arvioidaan ja rahoitus myönnetään kriteerien ja muiden tavoitteiden perusteella parhaiksi katsotuille hakemuksille.', tooltipEn: 'Funder´s call granting the funding. Competed research funding is often granted through open calls, in which funding is granted on the basis of prescribed criteria. Applications are evaluated and funding is granted to the best', tooltipSv: 'Utlysning av finansiär som har beviljat finansiering. Konkurrensutsatt forskningsfinansiering beviljas ofta genom öppna ansökningar, där beviljandet av finansiering grundar sig på kriterier som fastställts på förhand.'}
  ];

  other = [
    {label: $localize`Rahoituspäätöksen numero`, field: 'funderProjectNumber'},
    {label: $localize`Tieteenalat`, field: 'fieldsOfScience'},
    {label: $localize`Tutkimusalat`, field: 'fieldsOfResearch'},
    {label: $localize`Teema-alat`, field: 'fieldsOfTheme'},
    {label: $localize`Hankkeen verkkosivu`, field: '?'},
    // {label: $localize`Avainsanat`, field: 'keywords'},
  ];

  link = [
    {label: $localize`Linkit`, field: 'projectHomepage'}
  ];

  recipientTooltip = {
    tooltip: $localize`Rahoituksen saaja voi olla henkilö tai organisaatio. Usein saajaksi mainittu henkilö on vastuullinen tutkija, joka ei itse käytä myönnettyä rahoitusta vaan sillä katetaan hankkeen kustannuksia.`,
  };

  fundingAmountTooltip = {
    tooltip: $localize`Rahoittajan rahoituspäätöksessään myöntämä rahoitus. Summa ei sisällä hankkeen kaikkia kustannuksia. Organisaatio, jossa hanke toteutetaan, voi rahoittaa siitä tietyn osan (ns. omarahoitusosuus) ja hankkeella voi olla muitakin rahoittajia.`,
  };

  funderTooltip = {
    tooltip: $localize`Tutkimusrahoittaja, joka on myöntänyt rahoituksen. Kaikki tiedejatutkimus.fi &#8209;palveluun tietoja toimittavat tutkimusrahoittajat ovat organisaatiot-osiossa.`,
  };

  homepageTooltip = {
    tooltip: $localize`Tiedejatutkimus.fi -palvelun ulkopuolella oleva verkkosivu, jossa hankkeesta on tarkempaa tietoa.`,
  };

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
  funderFields: any[];
  currentLocale: string;
  tabData: any;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService,
               public utilityService: UtilityService) {
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
    this.tabQueryParams = this.tabChangeService.tabQueryParams.fundings;
    this.tabData = this.tabChangeService.tabData.find(item => item.data === 'fundings');
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
            this.setTitle(this.responseData.fundings[0].name + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.fundings[0].name + ' - Research.fi');
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
      return UtilityService.stringHasContent(this.responseData.fundings[0][item.field]);
    };

    const checkNestedEmpty = (parent: string, item: {field: string} ) =>  {
      return UtilityService.stringHasContent(this.responseData.fundings[0][parent][item.field]);
    };

    // Filter all the fields to only include properties with defined data
    this.infoFields = Object.assign(this.info.filter(item => checkEmpty(item)));
    // this.fundedFields = Object.assign(this.funded.filter(item => checkEmpty(item)));
    this.otherFields = Object.assign(this.other.filter(item => checkEmpty(item)));
    this.linkFields = Object.assign(this.link.filter(item => checkEmpty(item)));
    // Same for nested fields
    this.funderFields = Object.assign(this.funder.filter(item => checkNestedEmpty('funder', item)));
    // Filter out empty organization names
    this.responseData.fundings[0].recipient.organizations = this.responseData.fundings[0].recipient.organizations.filter(item =>
      item.name !== '' && item.name !== null);
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
