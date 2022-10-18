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
  @Output() onEditorClose = new EventEmitter<any>();

  showDialog: boolean;

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

  dialogTitle: string;
  dialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@continue:Jatka`, primary: true, method: 'save' }, // TODO: Render button only if selection has been made
  ];

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

  constructor(
    // private dialogRef: MatDialogRef<SearchPortalComponent>,
    private searchPortalService: SearchPortalService,
    private appSettingsService: AppSettingsService // @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.showDialog = true;

    this.setLocalizedContent();

    this.appSettingsService.mobileStatus
      .subscribe((status) => {
        this.mobile = status;
      })
      .unsubscribe();
  }

  setLocalizedContent() {
    switch (this.data.groupId) {
      case GroupTypes.publication: {
        this.dialogTitle = this.searchForMissingPublication;
        this.searchHelpText = this.searchForPublicationWithName;
        this.searchPlaceholder = this.publicationSearchPlaceholder;
        break;
      }
      case GroupTypes.dataset: {
        this.dialogTitle = this.searchForMissingDataset;
        this.searchHelpText = this.searchForDatasetsWithName;
        this.searchPlaceholder = this.datasetSearchPlaceholder;
        break;
      }
      case GroupTypes.funding: {
        this.dialogTitle = this.searchForMissingFunding;
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
      .getData(term, this.data.groupId)
      .pipe(take(1))
      .subscribe((result) => {
        this.results = result[this.data.groupId + 's'];
        this.total = result.total;
        this.loading = false;
      });
  }

  handleSelection(arr) {
    this.currentSelection = arr;

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

  doDialogAction(action: string) {
    switch (action) {
      case 'save': {
        let fieldType: number;

        switch (this.data.groupId) {
          case 'publication': {
            fieldType = this.fieldTypes.activityPublication;
            break;
          }
          case 'dataset': {
            fieldType = this.fieldTypes.activityDataset;
            break;
          }
          case 'funding': {
            fieldType = this.fieldTypes.activityFunding;
            break;
          }
        }

        const selection = this.currentSelection?.map((item) => ({
          ...item,
          itemMeta: {
            id: item.id,
            type: fieldType,
            show: true,
            primaryValue: true,
          },
        }));

        this.onEditorClose.emit(selection);
        break;
      }
      default: {
        this.onEditorClose.emit();
      }
    }

    this.showDialog = false;
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }
}
