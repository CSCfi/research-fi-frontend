//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  ElementRef,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { singleDataset, common } from 'src/assets/static-data/meta-tags.json';

@Component({
  selector: 'app-single-dataset',
  templateUrl: './single-dataset.component.html',
  styleUrls: ['./single-dataset.component.scss'],
})
export class SingleDatasetComponent implements OnInit {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  private metaTags = singleDataset;
  private commonTags = common;

  tab = 'datasets';

  infoFields = [
    { label: $localize`:@@description:Kuvaus`, field: 'description' },
    { label: $localize`:@@publicationYear:Julkaisuvuosi`, field: 'year' },
    { label: $localize`:@@datasetType:Aineiston tyyppi`, field: 'type' },
  ];
  
  authors = [
    { label: $localize`:@@authors:Tekijät`, field: 'authors' },
  ]

  project = [
    { label: $localize`:@@datasetProject:Projekti`, field: 'project' },
  ]
  

  otherInfoFields = [
    {
      label: $localize`:@@fieldsOfScience:Tieteenalat`,
      field: 'fieldsOfScience',
    },
    { label: $localize`:@@language:Kieli`, field: 'lang' },
    { label: $localize`:@@availability:Saatavuus`, field: 'availability' },
    { label: $localize`:@@license:Lisenssi`, field: 'license' },
    { label: $localize`:@@keywords:Avainsanat`, field: 'keywords' },
    {
      label: $localize`:@@temporalCoverage:Ajallinen kattavuus`,
      field: 'coverage',
    },
  ];

  otherFields = [
    {
      label: $localize`:@@relatedDatasets:Liittyvät aineistot`,
      field: 'name',
      tooltip: '',
    },
  ];

  linksFields = [{ label: $localize`:@@doi:DOI`, field: 'doi', tooltip: '' }];

  relatedList = [
    {
      labelFi: $localize`:@@publications:Julkaisut`,
      tab: 'publications',
      disabled: true,
    },
    { labelFi: $localize`:@@authors:Tutkijat`, tab: 'persons', disabled: true },
    { labelFi: $localize`:@@fundings:Hankkeet`, tab: '', disabled: true },
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

  copyReferences = $localize`:@@copyReferences:Kopioi viitetiedot`;
  copyToClipboard = $localize`:@@copyToClipboard:Kopioi leikepöydälle`;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  expand: boolean;
  latestSubUnitYear: string;
  faIcon = faAlignLeft;
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
    this.tabQueryParams = this.tabChangeService.tabQueryParams.datasets;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'datasets'
    );
    this.searchTerm = this.searchService.searchTerm;
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
    this.settingsService.related = false;
  }

  getData(id: string) {
    this.singleService.getSingleDataset(id).subscribe(
      (responseData) => {
        this.responseData = responseData;
        if (this.responseData.datasets[0]) {
          switch (this.localeId) {
            case 'fi': {
              this.setTitle(
                this.responseData.datasets[0].name + ' - Tiedejatutkimus.fi'
              );
              break;
            }
            case 'en': {
              this.setTitle(
                this.responseData.datasets[0].name.trim() + ' - Research.fi'
              );
              break;
            }
            case 'sv': {
              this.setTitle(
                this.responseData.datasets[0].name.trim() + ' - Forskning.fi'
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
        this.responseData.datasets[0][item.field]
      );
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter((item) => checkEmpty(item));
    this.otherInfoFields = this.otherInfoFields.filter((item) =>
      checkEmpty(item)
    );
    this.otherFields = this.otherFields.filter((item) => checkEmpty(item));
    this.linksFields = this.linksFields.filter((item) => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData.datasets[0];
  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
