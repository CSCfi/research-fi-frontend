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
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { Sort } from '@angular/material/sort';
import {
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import {
  DatasetColumns,
  FundingColumns,
  PublicationColumns,
} from '@mydata/constants';
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
  @Input() selectedInSession: any[];

  @Output() onItemToggle = new EventEmitter<any>();
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onSortToggle = new EventEmitter<any>();

  showMoreArray = [];
  publicationArray = [];

  currentPage = 1;
  currentPageSize = 10;
  pageCount: number;

  faSort = faSort;
  faSortDown = faSortDown;
  faSortUp = faSortUp;

  columns: string[] = ['selection', 'year', 'name', 'show-more'];

  sortSettings: any;
  selectedItemsIdArray: any[] = [];
  currentSelection = [];

  idField = 'id';

  currentTable: any;

  locale = this.appSettingsService.capitalizedLocale;

  publicationsTable = {
    idField: 'id',
    columns: PublicationColumns.filter((column) => column.id !== 'source'),
  };

  datasetsTable = {
    idField: 'id',
    columns: DatasetColumns.filter((column) => column.id !== 'source'),
  };

  fundingsTable = {
    idField: 'id',
    columns: FundingColumns.filter((column) => column.id !== 'source'),
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  termSub: Subscription;
  activeSort: Sort;
  selectedInSessionIds: any[] = [];

  constructor(
    private searchPortalService: SearchPortalService,
    private appSettingsService: AppSettingsService
  ) {
    this.sortSettings = this.searchPortalService.currentSort;
  }

  ngOnInit() {
    // Set default sort (all groups default to year field at this point)
    this.activeSort = { active: 'year', direction: 'desc' };

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
    if (this.itemsInProfile.length) {
      const profileItemIDs = this.itemsInProfile
        .map((item) => item.id)
        .filter((item) => item?.toString().trim().length);

      this.selectedItemsIdArray = profileItemIDs;
    }
  }

  ngOnChanges() {
    this.pageCount = Math.ceil(this.total / this.currentPageSize);

    // Items selected in active session are stored in parent component.
    // This prevents selections to lose checked status if page settings is changed
    this.selectedInSessionIds = this.selectedInSession.map((item) => item.id);
  }

  ngOnDestroy() {
    this.termSub?.unsubscribe();
  }

  toggleShowMore(index) {
    const arr = this.showMoreArray;
    const item = arr.indexOf(index);

    if (item > -1) {
      arr.splice(item, 1);
    } else {
      this.showMoreArray.push(index);
    }
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

    let arr = this.currentSelection;

    if (event.checked) {
      // Prevent adding of duplicate items
      !arr.find((item) => item.id === selectedItem.id) &&
        arr.push({ ...selectedItem, show: true });
    } else {
      arr = arr.filter((item) => item.id !== selectedItem.id);
      this.currentSelection = arr;
    }

    this.onItemToggle.emit(arr);
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.activeSort = null;
      return;
    }

    this.activeSort = sort;
    this.onSortToggle.emit(sort);
  }

  navigate(event) {
    this.data = [];
    this.currentPage = event.pageIndex + 1;
    this.currentPageSize = event.pageSize;

    this.pageCount = Math.ceil(this.total / event.pageSize);

    this.onPageChange.emit(event);
  }
}
