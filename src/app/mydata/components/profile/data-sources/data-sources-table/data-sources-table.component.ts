//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Sort, SortDirection } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { FiltersConfig, TableColumns } from '@mydata/constants';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { first, Subscription } from 'rxjs';
import { TableRow } from 'src/types';
import { TableComponent } from '@shared/components/table/table.component';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-data-sources-table',
  templateUrl: './data-sources-table.component.html',
  styleUrls: ['./data-sources-table.component.scss'],
})
export class DataSourcesTableComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() data: any;
  @Output() onSelectionChange = new EventEmitter<number>();

  public fieldTypes = FieldTypes;

  dataMapped: boolean;

  activeSort: string;
  sortDirection: SortDirection;

  @ViewChildren('contentCell') contentCells: QueryList<ElementRef>;
  @ViewChildren('textContent') textContent: QueryList<ElementRef>;
  @ViewChildren('publicityCell') publicityCells: QueryList<ElementRef>;
  // @ViewChildren('sharingCell') sharingCells: QueryList<ElementRef>;

  @ViewChild(TableComponent) table: TableComponent;

  tableColumns = TableColumns;

  tableRows: Record<string, TableRow>[];

  originalDataSources: any;

  devDataSource = {
    active: true,
    selection: true,
    name: 'Name of data source',
    content: 'Some dynamic content',
    public: false,
    source: 'Source of data',
    sharing: [0],
  };

  shareTargets = [
    { label: 'Tiedejatutkimus.fi' },
    { label: 'Organisaatio X' },
    { label: 'Palvelu Y' },
  ];

  itemsPerPage = 10;
  rawProfileRows: any[] = [];

  filtersConfig = FiltersConfig;
  queryParamsSub: Subscription;

  // Pagination
  pageNumber: number = 1;
  pageSize: number = 10;
  total: number;

  locale: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.handleProfileData(this.data);

    /*
     * Handle sorting & pagination from query parameters
     * Active sort can be selected from table or reusable sort by button component
     */
    const initialQueryParams = this.route.snapshot.queryParams;

    // Initial sort parameters
    this.activeSort = initialQueryParams.sort;
    this.sortDirection = initialQueryParams.sortDirection || 'asc';

    // When sorting changes
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      if (this.dataMapped) {
        this.sort({ active: params.sort, direction: params.sortDirection });
      }

      this.pageNumber = Number(params.page) || 1;
    });

    this.locale = this.appSettingsService.capitalizedLocale;
  }

  // Handle data again when data is filtered
  ngOnChanges(): void {
    if (this.dataMapped) {
      this.updateData();
    }
  }

  updateData() {
    this.rawProfileRows = [];
    this.handleProfileData(this.data);
    this.cdr.detectChanges();
    this.mapData();
  }

  // Allow templates to be rendered before mapping data from cells
  ngAfterViewInit(): void {
    this.mapData();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
  }

  // Create raw data for table rows
  handleProfileData(profileData) {
    // Filter out empty groups and flatten structure
    const filteredGroups = profileData
      .flatMap((group) => group.fields)
      .filter((group) => group.items.length);

    for (const group of filteredGroups) {
      for (const groupItem of group.items) {
        this.rawProfileRows.push({
          ...groupItem,
          groupLabel: group.label,
          source: groupItem.dataSources,
        });
      }
    }
  }

  /*
   * Map data for table view.
   * Cells are rendered from dynamic templates and content can be
   * either projected from template or added dynamically below.
   */
  mapData() {
    // Data from templates
    const contentCellItems = this.contentCells.toArray();
    const publicityCellItems = this.publicityCells.toArray();
    // const sharingCellItems = this.sharingCells.toArray();

    const rows = [];

    for (const [index, item] of this.rawProfileRows.entries()) {
      rows.push({
        selection: {},
        name: { label: item.groupLabel },
        content: { template: contentCellItems[index] },
        public: {
          template: publicityCellItems[index],
          label: item.itemMeta.show, // Used for sorting
          value: item.itemMeta.show, // Used for row color highlight
        },
        source: {
          label: item.source
            .map((source) => source.organization.nameFi)
            .join(', '),
        },
        // sharing: {
        //   template: sharingCellItems[index],
        //   label: sharingCellItems[index],
        // },
      });
    }

    this.tableRows = rows;

    // Initial sorting
    if (this.activeSort) {
      this.sort({ active: this.activeSort, direction: this.sortDirection });
    }

    /*
     * Get content cell as text for sorting purposes. Previously declared
     * ´contentCellItems´ is for getting template refs only and does not contain
     * any usable text content.
     * Elements get duplicated because of Angular ng-template html output,
     * therefore we need to filter these elements to get corresponding values
     */
    this.textContent.changes.pipe(first()).subscribe((content) => {
      const textContent = content
        .toArray()
        .map((item) => item.nativeElement.innerText)
        .filter((_item, index) => index % 2 === 0);

      this.tableRows.forEach((row, index) => {
        row.content.label = textContent[index]?.trim();
      });

      // Create a copy of original data for sort reset
      this.originalDataSources = [...this.tableRows];
    });

    // Set flag for onChanges hook so it doesn't re-render on init
    this.dataMapped = true;

    this.updatePagination();
  }

  sort(sort: Sort) {
    // Create a shallow copy of current rows so original data doesn't change
    const data = this.tableRows.slice();

    if (!sort.active || sort.direction === '') {
      this.activeSort = '';
      this.tableRows = this.originalDataSources;
      return;
    }

    // Simple compare method for returning numeric value for JS sort() function
    const compare = (
      a: string | number,
      b: string | number,
      isAsc: boolean
    ) => {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    };

    // Inference correct sort column and sort with compare -method
    const sortables: string[] = this.tableColumns.map((column) => column.key);

    this.tableRows = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const matchIndex = sortables.indexOf(sort.active);

      if (matchIndex > -1) {
        return compare(
          a[sortables[matchIndex]].label,
          b[sortables[matchIndex]].label,
          isAsc
        );
      } else {
        return 0;
      }
    });

    this.activeSort = sort.active;
    this.sortDirection = sort.direction;
  }

  handleSelection(selectedRows) {
    this.onSelectionChange.emit(selectedRows);
  }

  clearSelections() {
    this.table.handleSelectAll({ checked: false, source: null });
    this.updateData();
  }

  updatePagination() {
    this.total = this.tableRows.length;
  }
}
