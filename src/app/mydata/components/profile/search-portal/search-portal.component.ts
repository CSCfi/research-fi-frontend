//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { take } from 'rxjs/operators';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { SearchPortalService } from '@mydata/services/search-portal.service';
import { GroupTypes } from '@mydata/constants/groupTypes';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-portal',
  templateUrl: './search-portal.component.html',
  styleUrls: ['./search-portal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchPortalComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Output() onAddItems = new EventEmitter<any>();

  results: any;
  total: number;
  loading: boolean;
  currentSelection: any[];
  currentTerm: string;
  mobile: boolean;

  public fieldTypes = FieldTypes;
  public groupTypes = GroupTypes;

  addPublication = $localize`:@@addPublication:Lisää julkaisu`;
  addPublications = $localize`:@@addPublications:Lisää julkaisut`;

  addDataText: string;
  addDataPluralText: string;

  searchHelpText: string;
  searchPlaceholder: string;

  searchSub: Subscription;

  searchForMissingPublication = $localize`:@@searchForMissingPublication:Puuttuvan julkaisun hakeminen`;
  searchForMissingDataset = $localize`:@@searchForMissingDataset:Puuttuvan tutkimusaineiston hakeminen`;
  searchForMissingFunding = $localize`:@@searchForMissingFunding:Puuttuvan hankkeen hakeminen`;

  searchForPublicationWithName = $localize`:@@searchForPublicationWithName:Hae omalla nimelläsi tai julkaisun nimellä`;
  searchForDatasetsWithName = $localize`:@@searchForDatasetWithName:Hae nimellä tai organisaatiolla`;
  searchForFundingsWithName = $localize`:@@searchForFundingWithName:Hae hankkeen tai vastuullisen tutkijan nimellä`;

  publicationSearchPlaceholder = $localize`:@@nameOfPublicationOrAuthor:Julkaisun tai tekijän nimi`;
  datasetSearchPlaceholder = $localize`:@@datasetSearchPlaceholder:Esim. nimi, organisaatio`;
  fundingSearchPlaceholder = $localize`:@@enterPartOfName:Kirjoita osa nimestä`;

  itemsInProfile: any[];

  constructor(
    private searchPortalService: SearchPortalService,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.setLocalizedContent();

    this.appSettingsService.mobileStatus
      .subscribe((status) => {
        this.mobile = status;
      })
      .unsubscribe();

    this.itemsInProfile = this.data.fields.flatMap((field) => field.items);
  }

  setLocalizedContent() {
    switch (this.data.id) {
      case GroupTypes.publication: {
        this.searchHelpText = this.searchForPublicationWithName;
        this.searchPlaceholder = this.publicationSearchPlaceholder;
        break;
      }
      case GroupTypes.dataset: {
        this.searchHelpText = this.searchForDatasetsWithName;
        this.searchPlaceholder = this.datasetSearchPlaceholder;
        break;
      }
      case GroupTypes.funding: {
        this.searchHelpText = this.searchForFundingsWithName;
        this.searchPlaceholder = this.fundingSearchPlaceholder;
        break;
      }
    }
  }

  handleSearch(term: string) {
    this.searchPortalService.updateSearchTerm(term);
    this.searchPortalService.updatePageSettings(null);
    this.currentTerm = term;
    this.search(term);
  }

  search(term: string) {
    this.results = [];
    this.loading = true;

    this.searchSub = this.searchPortalService
      .getData(term, this.data.id)
      .pipe(take(1))
      .subscribe((result) => {
        this.results = result[this.data.id + 's'];
        this.total = result.total;
        this.loading = false;
      });
  }

  handleSelection(arr) {
    this.currentSelection = arr;

    this.onAddItems.emit(arr);

    if (this.total > 0 && arr.length > 0) {
    }
  }

  changePage(pageSettings: object) {
    this.searchPortalService.updatePageSettings(pageSettings);
    this.search(this.currentTerm);
  }

  sort(sortSettings) {
    this.searchPortalService.updateSort(this.data.groupId, sortSettings);
    this.search(this.currentTerm);
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }
}
