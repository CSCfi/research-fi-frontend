import { Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { Search } from 'src/app/models/search.model';
import { SearchService } from 'src/app/services/search.service';
import { SettingsService } from 'src/app/services/settings.service';
import { SingleItemService } from 'src/app/services/single-item.service';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { UtilityService } from 'src/app/services/utility.service';
import { singleMaterial, common } from 'src/assets/static-data/meta-tags.json';


@Component({
  selector: 'app-single-material',
  templateUrl: './single-material.component.html',
  styleUrls: ['./single-material.component.scss']
})
export class SingleMaterialComponent implements OnInit {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  private metaTags = singleMaterial;
  private commonTags = common;

  tab = 'materials';

  sources = {
    finto: $localize`:@@fintoSource:Lähde: Finto - sanasto- ja ontologiapalvelu www.finto.fi`,
    ytj: $localize`:@@ytjSource:Lähde: Yritys- ja yhteisötietojärjestelmä (YTJ) www.ytj.fi`,
    tk: $localize`:@@tkSource:Lähde: Tilastokeskus www.stat.fi`,
    vipunen: $localize`:@@vipunenSource:Lähde: Vipunen – opetushallinnon tilastopalvelu www.vipunen.fi`
  }

  infoFields = [
    {label: $localize`:@@orgNameTranslation:Nimi (EN, SV)`, field: 'nameTranslations'},
    {label: $localize`:@@orgOtherNames:Muut nimet`, field: 'variantNames', tooltip: this.sources.finto},
    {label: $localize`:@@orgEstablished:Perustettu`, field: 'established', tooltip: this.sources.finto},
    {label: $localize`:@@orgBackground:Lisätietoa`, field: 'background', tooltip: this.sources.finto},
    {label: $localize`:@@orgPredecessor:Edeltävä organisaatio`, field: 'predecessors', tooltip: this.sources.finto},
    {label: $localize`:@@orgRelated:Liittyvä organisaatio`, field: 'related', tooltip: this.sources.finto},
    {label: $localize`:@@orgType:Organisaatiomuoto`, field: 'organizationType', tooltip: this.sources.ytj},
    {label: $localize`:@@orgSector:Organisaation tyyppi`, field: 'sectorNameFi', tooltip: this.sources.ytj},
    {label: $localize`:@@orgVAddress:Käyntiosoite`, field: 'visitingAddress', tooltip: this.sources.ytj},
    {label: $localize`:@@orgAddress:Postiosoite`, field: 'postalAddress', tooltip: this.sources.ytj},
    {label: $localize`:@@orgBID:Y-tunnus`, field: 'businessId', tooltip: this.sources.ytj},
    {label: $localize`:@@orgSTID:Tilastokeskuksen oppilaitostunnus`, field: 'statCenterId', tooltip: this.sources.tk},
    {label: $localize`:@@orgStaffCount:Opetus- ja tutkimushenkilöstön määrä (htv)`, field: 'staffCountAsFte', tooltip: this.sources.vipunen},
  ];

  studentCounts = [
    {label: $localize`:@@orgThesisCountBsc:Alempi korkeakoulututkinto`, field: 'thesisCountBsc'},
    {label: $localize`:@@orgThesisCountMsc:Ylempi korkeakoulututkinto`, field: 'thesisCountMsc'},
    {label: $localize`:@@orgThesisCountLic:Lisensiaatintutkinto`, field: 'thesisCountLic'},
    {label: $localize`:@@orgThesisCountPhd:Tohtorintutkinto`, field: 'thesisCountPhd'}
  ];

  subUnitFields = [
    {label: $localize`:@@orgSubUnits:Alayksiköt`, field: 'subUnits', tooltip: this.sources.vipunen}
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

  // Translation links
  vipunenLink = {
    Fi: 'https://vipunen.fi/',
    En: 'https://vipunen.fi/en-gb/',
    Sv: 'https://vipunen.fi/sv-fi/'
  }

  statcenterLink = {
    Fi: 'http://www.tilastokeskus.fi/',
    En: 'http://www.tilastokeskus.fi/index_en.html',
    Sv: 'http://www.tilastokeskus.fi/index_sv.html'
  }

  fintoLink = {
    Fi: 'http://finto.fi/cn/fi/',
    En: 'http://finto.fi/cn/en/',
    Sv: 'http://finto.fi/cn/sv/'
  }

  ytjLink = {
    Fi: 'https://www.ytj.fi/',
    En: 'https://www.ytj.fi/en/index.html',
    Sv: 'https://www.ytj.fi/sv/index.html'
  }


  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  expand: boolean;
  latestSubUnitYear: string;
  faIcon = faAlignLeft;
  subUnitSlice = 10;
  currentLocale: string;
  tabData: any;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, private searchService: SearchService,
               private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService,
               public utilityService: UtilityService, private settingsService: SettingsService ) {
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
    this.tabQueryParams = this.tabChangeService.tabQueryParams.materials;
    this.tabData = this.tabChangeService.tabData.find(item => item.data === 'materials');
    this.searchTerm = this.searchService.searchTerm;
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
    this.settingsService.related = false;
  }

  getData(id: string) {
    this.singleService.getSingleMaterial(id)
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData.materials[0]) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(this.responseData.materials[0].name + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.materials[0].name.trim() + ' - Research.fi');
            break;
          }
          case 'sv': {
            this.setTitle(this.responseData.materials[0].name.trim() + ' - Forskning.fi');
            break;
          }
        }
        const titleString = this.titleService.getTitle();
        this.srHeader.nativeElement.innerHTML = titleString.split(' - ', 1);
        this.utilityService.addMeta(titleString,
          this.metaTags['description' + this.currentLocale], this.commonTags['imgAlt' + this.currentLocale])

        this.shapeData();
        this.filterData();
      }
    },
      error => this.errorMessage = error as any);
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: {field: string} ) =>  {
      return UtilityService.stringHasContent(this.responseData.materials[0][item.field]);
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.studentCounts = this.studentCounts.filter(item => checkEmpty(item));
    this.subUnitFields = this.subUnitFields.filter(item => checkEmpty(item));
    this.linkFields = this.linkFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData.materials[0];

  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
