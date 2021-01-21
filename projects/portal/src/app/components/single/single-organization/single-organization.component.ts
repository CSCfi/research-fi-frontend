//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  Inject,
  LOCALE_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '@portal.services/single-item.service';
import { SearchService } from '@portal.services/search.service';
import { Title } from '@angular/platform-browser';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { TabChangeService } from '@portal.services/tab-change.service';
import { UtilityService } from '@portal.services/utility.service';
import { Search } from '@portal.models/search.model';
import {
  singleOrganization,
  common,
} from '@portal.assets/static-data/meta-tags.json';
import { SettingsService } from '@portal.services/settings.service';

@Component({
  selector: 'app-single-organization',
  templateUrl: './single-organization.component.html',
  styleUrls: ['./single-organization.component.scss'],
})
export class SingleOrganizationComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  private metaTags = singleOrganization;
  private commonTags = common;

  tab = 'organizations';

  sources = {
    finto: $localize`:@@fintoSource:Lähde: Finto - sanasto- ja ontologiapalvelu www.finto.fi`,
    ytj: $localize`:@@ytjSource:Lähde: Yritys- ja yhteisötietojärjestelmä (YTJ) www.ytj.fi`,
    tk: $localize`:@@tkSource:Lähde: Tilastokeskus www.stat.fi`,
    vipunen: $localize`:@@vipunenSource:Lähde: Vipunen – opetushallinnon tilastopalvelu www.vipunen.fi`,
  };

  infoFields = [
    {
      label: $localize`:@@orgNameTranslation:Nimi (EN, SV)`,
      field: 'nameTranslations',
    },
    {
      label: $localize`:@@orgOtherNames:Muut nimet`,
      field: 'variantNames',
      tooltip: this.sources.finto,
    },
    {
      label: $localize`:@@orgEstablished:Perustettu`,
      field: 'established',
      tooltip: this.sources.finto,
    },
    {
      label: $localize`:@@orgBackground:Lisätietoa`,
      field: 'background',
      tooltip: this.sources.finto,
    },
    {
      label: $localize`:@@orgPredecessor:Edeltävä organisaatio`,
      field: 'predecessors',
      tooltip: this.sources.finto,
    },
    {
      label: $localize`:@@orgRelated:Liittyvä organisaatio`,
      field: 'related',
      tooltip: this.sources.finto,
    },
    {
      label: $localize`:@@orgType:Organisaatiomuoto`,
      field: 'organizationType',
      tooltip: this.sources.ytj,
    },
    {
      label: $localize`:@@orgSector:Organisaation tyyppi`,
      field: 'sectorNameFi',
      tooltip: this.sources.ytj,
    },
    {
      label: $localize`:@@orgVAddress:Käyntiosoite`,
      field: 'visitingAddress',
      tooltip: this.sources.ytj,
    },
    {
      label: $localize`:@@orgAddress:Postiosoite`,
      field: 'postalAddress',
      tooltip: this.sources.ytj,
    },
    {
      label: $localize`:@@orgBID:Y-tunnus`,
      field: 'businessId',
      tooltip: this.sources.ytj,
    },
    {
      label: $localize`:@@orgSTID:Tilastokeskuksen oppilaitostunnus`,
      field: 'statCenterId',
      tooltip: this.sources.tk,
    },
    {
      label: $localize`:@@orgStaffCount:Opetus- ja tutkimushenkilöstön määrä (htv)`,
      field: 'staffCountAsFte',
      tooltip: this.sources.vipunen,
    },
  ];

  studentCounts = [
    {
      label: $localize`:@@orgThesisCountBsc:Alempi korkeakoulututkinto`,
      field: 'thesisCountBsc',
    },
    {
      label: $localize`:@@orgThesisCountMsc:Ylempi korkeakoulututkinto`,
      field: 'thesisCountMsc',
    },
    {
      label: $localize`:@@orgThesisCountLic:Lisensiaatintutkinto`,
      field: 'thesisCountLic',
    },
    {
      label: $localize`:@@orgThesisCountPhd:Tohtorintutkinto`,
      field: 'thesisCountPhd',
    },
  ];

  subUnitFields = [
    {
      label: $localize`:@@orgSubUnits:Alayksiköt`,
      field: 'subUnits',
      tooltip: this.sources.vipunen,
    },
  ];

  linkFields = [{ label: $localize`:@@links:Linkit`, field: 'homepage' }];

  relatedList = [
    {
      labelFi: $localize`:@@publications:Julkaisut`,
      tab: 'publications',
      disabled: false,
    },
    { labelFi: $localize`:@@authors:Tutkijat`, tab: 'persons', disabled: true },
    { labelFi: $localize`:@@materials:Aineistot`, tab: '', disabled: true },
    {
      labelFi: $localize`:@@infrastructures:Infrastruktuurit`,
      tab: 'infrastructures',
      disabled: true,
    },
    {
      labelFi: $localize`:@@otherResearchActivity:Muu tutkimustoiminta`,
      tab: '',
      disabled: true,
    },
  ];

  // Translation links
  vipunenLink = {
    Fi: 'https://vipunen.fi/',
    En: 'https://vipunen.fi/en-gb/',
    Sv: 'https://vipunen.fi/sv-fi/',
  };

  statcenterLink = {
    Fi: 'http://www.tilastokeskus.fi/',
    En: 'http://www.tilastokeskus.fi/index_en.html',
    Sv: 'http://www.tilastokeskus.fi/index_sv.html',
  };

  fintoLink = {
    Fi: 'http://finto.fi/cn/fi/',
    En: 'http://finto.fi/cn/en/',
    Sv: 'http://finto.fi/cn/sv/',
  };

  ytjLink = {
    Fi: 'https://www.ytj.fi/',
    En: 'https://www.ytj.fi/en/index.html',
    Sv: 'https://www.ytj.fi/sv/index.html',
  };

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  expand: boolean;
  latestSubUnitYear: string;
  faIcon = faFileAlt;
  subUnitSlice = 10;
  currentLocale: string;
  tabData: any;

  constructor(
    private route: ActivatedRoute,
    private singleService: SingleItemService,
    private searchService: SearchService,
    private titleService: Title,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    public utilityService: UtilityService,
    private settingsService: SettingsService
  ) {
    // Capitalize first letter of locale
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.route.params.subscribe((params) => {
      this.getData(params.id);
    });
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.organizations;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'organizations'
    );
    this.searchTerm = this.searchService.searchTerm;
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
    this.settingsService.related = false;
  }

  getData(id: string) {
    this.singleService.getSingleOrganization(id).subscribe(
      (responseData) => {
        this.responseData = responseData;
        if (this.responseData.organizations[0]) {
          switch (this.localeId) {
            case 'fi': {
              this.setTitle(
                this.responseData.organizations[0].name +
                  ' - Tiedejatutkimus.fi'
              );
              break;
            }
            case 'en': {
              this.setTitle(
                this.responseData.organizations[0].name.trim() +
                  ' - Research.fi'
              );
              break;
            }
            case 'sv': {
              this.setTitle(
                this.responseData.organizations[0].name.trim() +
                  ' - Forskning.fi'
              );
              break;
            }
          }
          const titleString = this.titleService.getTitle();
          this.srHeader.nativeElement.innerHTML = titleString.split(' - ', 1);
          this.utilityService.addMeta(
            titleString,
            this.metaTags['description' + this.currentLocale],
            this.commonTags['imgAlt' + this.currentLocale]
          );

          this.shapeData();
          this.filterData();
        }
      },
      (error) => (this.errorMessage = error as any)
    );
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: { field: string }) => {
      return UtilityService.stringHasContent(
        this.responseData.organizations[0][item.field]
      );
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter((item) => checkEmpty(item));
    this.studentCounts = this.studentCounts.filter((item) => checkEmpty(item));
    this.subUnitFields = this.subUnitFields.filter((item) => checkEmpty(item));
    this.linkFields = this.linkFields.filter((item) => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData.organizations[0];
    const locale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);

    const subUnits = source.subUnits;

    // Name translations
    source.nameTranslations = Object.values(source.nameTranslations)
      .filter((x) => UtilityService.stringHasContent(x))
      .join('; ');

    // Hide statCenterId from other organizations than universities
    if (
      !(source.sectorNameFi === 'Ammattikorkeakoulu') &&
      !(source.sectorNameFi === 'Yliopisto')
    ) {
      source.statCenterId = '';
    }

    // Check for applied university to display correct field name
    if (source.sectorNameFi === 'Ammattikorkeakoulu') {
      this.studentCounts[0].label = $localize`:@@orgThesisCountBscApplied:Alempi ammattikorkeakoulutukinto`;
      this.studentCounts[1].label = $localize`:@@orgThesisCountMscApplied:Ylempi ammattikorkeakoulutukinto`;
    }

    if (subUnits && subUnits.length > 0) {
      // Get latest year of subUnits. Data is in string format
      const subUnitYears = [...new Set(subUnits.map((item) => item.year))];
      const transformedYears = subUnitYears.map(Number);
      this.latestSubUnitYear = Math.max(...transformedYears).toString();
      source.subUnits = source.subUnits.filter(
        (item) => item.year === this.latestSubUnitYear
      );
      // Sort sub units by name
      source.subUnits.sort((a, b) => {
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
