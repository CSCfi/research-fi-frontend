//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { SearchPortalService } from '@mydata/services/search-portal.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-portal-results',
  templateUrl: './search-portal-results.component.html',
  styleUrls: ['./search-portal-results.component.scss'],
  encapsulation: ViewEncapsulation.None,
})


export class SearchPortalResultsComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() groupId: string;
  @Input() data: any[];
  @Input() total: number;
  @Input() itemsInProfile: any;
  @Input() selectedItems: any;
  @Output() onItemToggle = new EventEmitter<any>();
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onSortToggle = new EventEmitter<any>();

  showMoreArray = [];
  publicationArray = [];

  currentPage = 1;
  currentPageSize = 10;
  pageCount: number;

  columns: string[] = ['selection', 'year', 'name', 'show-more'];

  sortSettings: any;
  selectedItemsIdArray: any[];

  idField = 'id';

  currentTable: any;

  locale = this.appSettingsService.capitalizedLocale;

  publicationsTable = {
    idField: 'id',
    defaultSort: 'year',
    columns: [
      {
        id: 'year',
        label: $localize`:@@year:Vuosi`,
        field: 'publicationYear',
      },
      {
        id: 'name',
        ellipsis: true,
        label: $localize`:@@name:Nimi`,
        field: 'title',
        additionalFields: [
          { field: 'authors', ellipsis: true },
          { field: 'parentPublicationName', hidden: true },
          { field: 'doi', hidden: true },
        ],
      },
    ],
  };

  datasetsTable = {
    idField: 'id',
    defaultSort: 'year',
    columns: [
      {
        id: 'year',
        label: $localize`:@@year:Vuosi`,
        field: 'year',
      },
      {
        id: 'name',
        ellipsis: true,
        label: $localize`:@@name:Nimi`,
        field: 'name',
        additionalFields: [
          {
            field: 'description',
            ellipsis: true,
            cutContent: true,
          },
          { field: 'authors', useComponent: true, hidden: true },
          { field: 'urn', hidden: true },
        ],
      },
    ],
  };

  fundingsTable = {
    idField: 'id',
    defaultSort: 'year',
    columns: [
      {
        id: 'year',
        label: $localize`:@@year:Vuosi`,
        field: 'startYear',
      },
      {
        id: 'name',
        ellipsis: true,
        label: $localize`:@@name:Nimi`,
        field: 'name',
        additionalFields: [
          { field: 'funderProjectNumber' },
          {
            field: 'description',
            ellipsis: true,
            cutContent: true,
          },
          {
            field: 'recipient.combined',
            hidden: true,
          },
          {
            field: 'funder.typeOfFundingName',
            hidden: true,
          },
          {
            field: 'funder.name',
            hidden: true,
          },
        ],
      },
    ],
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  termSub: Subscription;

  constructor(
    private searchPortalService: SearchPortalService,
    private appSettingsService: AppSettingsService
  ) {
    this.sortSettings = this.searchPortalService.currentSort;
  }

  ngOnInit() {
    // Set table by groupId
    switch (this.groupId) {
      case 'publication': {
        this.currentTable = this.publicationsTable;
        break;
      }
      case 'dataset': {
        this.currentTable = this.datasetsTable;
        break;
      }
      case 'funding': {
        this.currentTable = this.fundingsTable;
        break;
      }
    }

    // Reset to first page on term change
    this.termSub = this.searchPortalService.currentTerm.subscribe(() => {
      this.currentPage = 1;
      if (this.paginator) this.paginator.pageIndex = 0;
    });

    // Create list of ids that we can match for existing selections in template
    const profileItems = this.itemsInProfile
      .flatMap((item) => item.items)
      .map((item) => item.id)
      .filter((item) => item?.toString().trim().length);

    this.selectedItemsIdArray = profileItems;
  }

  ngOnChanges() {
    this.pageCount = Math.ceil(this.total / this.currentPageSize);
  }

  ngOnDestroy() {
    this.termSub?.unsubscribe();
  }

  showMore(index) {
    this.showMoreArray.push(index);
  }

  showLess(index) {
    const arr = this.showMoreArray;
    const item = arr.indexOf(index);

    arr.splice(item, 1);
  }

  toggleItem(event, index) {
    const selectedItem = this.data[index];
    let selectedItems = this.selectedItems;

    let arr = this.publicationArray;

    if (selectedItems.find((item) => item.id === selectedItem.id)) {
      arr.push({
        ...selectedItems.find((item) => item.id === selectedItem.id),
        show: event.checked,
      });
    } else {
      event.checked
        ? arr.find((item) => item.id === selectedItem.id)
          ? null // Prevent adding of duplicate items
          : arr.push({ ...selectedItem, show: true })
        : (arr = arr.filter((item) => item.id !== selectedItem.id));
    }

    this.onItemToggle.emit(arr);
  }

  sortData(sortSettings) {
    this.onSortToggle.emit(sortSettings);
  }

  navigate(event) {
    this.data = [];
    this.currentPage = event.pageIndex + 1;
    this.currentPageSize = event.pageSize;

    this.pageCount = Math.ceil(this.total / event.pageSize);

    this.onPageChange.emit(event);
  }
}
