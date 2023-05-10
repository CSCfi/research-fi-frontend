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
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-data-sources-table',
  templateUrl: './data-sources-table.component.html',
  styleUrls: ['./data-sources-table.component.scss'],
})
export class DataSourcesTableComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() data: any;
  @Output() onSelectionChange = new EventEmitter<string[]>();

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
  expandedRows = [];

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

  maxContentLength = 35;
  mobileStatusSub: Subscription;
  mobile: boolean;
  rowCheckboxTicks: string[] = [];
  allSelected: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    public appSettingsService: AppSettingsService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

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

    this.mobileStatusSub = this.appSettingsService.mobileStatus.subscribe(
      (status) => {
        this.mobile = status;
      }
    );
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
    this.mobileStatusSub?.unsubscribe();
  }

  // Create raw data for table rows
  handleProfileData(profileData) {
    // Filter out empty groups and flatten structure
    const filteredGroups = profileData
      .flatMap((group) => group.fields)
      .filter((group) => group.items.length);

    for (const group of filteredGroups) {
      for (const item of group.items) {
        let displayValue: string;

        switch (item.itemMeta.type) {
          case FieldTypes.activityAffiliation: {
            displayValue = [item.positionName, item.organizationName]
              .filter((item) => item.length > 0)
              .join(', ');
            break;
          }
          case FieldTypes.activityEducation: {
            displayValue = item.degreeGrantingInstitutionName;
            break;
          }
          case FieldTypes.activityPublication:
          case FieldTypes.activityOrcidPublication: {
            displayValue = item.title;
            break;
          }
          case FieldTypes.activityDataset:
          case FieldTypes.activityFunding:
          case FieldTypes.activityActivitesAndRewards: {
            displayValue = item.name;
            break;
          }
          default: {
            displayValue = item.value;
          }
        }

        this.rawProfileRows.push({
          ...item,
          groupLabel: group.label,
          source: item.dataSources,
          displayValue: displayValue,
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
        selection: { checkboxDisabled: item.itemMeta.type === 110, entryId: item.itemMeta.temporaryUniqueId.toString() },
        name: { label: item.groupLabel },
        content: { template: contentCellItems[index] },
        public: {
          template: publicityCellItems[index],
          label: item.itemMeta.show, // Used for sorting
          value: item.itemMeta.show, // Used for row color highlight
        },
        source: {
          label: item.source
            ?.map((source) => source.organization.nameFi)
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

  handleSelection(selectedRowUniqueId) {
    this.rowCheckboxTicks.find((index) => index === selectedRowUniqueId) !== undefined
      ? (this.rowCheckboxTicks = this.rowCheckboxTicks.filter(
          (index) => index !== selectedRowUniqueId
        ))
      : this.rowCheckboxTicks.push(selectedRowUniqueId);
    this.onSelectionChange.emit(this.rowCheckboxTicks);
    this.allSelected = this.rowCheckboxTicks.length + 1 === this.tableRows.length;
  }

  handleSelectAll(event: MatCheckboxChange) {
    let rowIds = event.checked
      ? this.tableRows.map((_row, index) => {
        if (_row.selection.checkboxDisabled === false) return _row.selection.entryId.toString()})
      : [];

    rowIds = rowIds.filter(item => !!item);
    this.rowCheckboxTicks = rowIds.map(String);

    this.onSelectionChange.emit(this.rowCheckboxTicks);
    this.allSelected = event.checked;
  }

  clearSelections() {
    this.table.handleSelectAll({ checked: false, source: null });
    this.updateData();
  }

  updatePagination() {
    this.total = this.tableRows.length;
  }

  toggleRowExpand(index) {
    this.expandedRows.indexOf(index) > -1
      ? (this.expandedRows = this.expandedRows.filter((i) => i !== index))
      : this.expandedRows.push(index);
  }
}
