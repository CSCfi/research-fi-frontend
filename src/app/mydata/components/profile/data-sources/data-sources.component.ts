//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants, FiltersConfig, TableColumns } from '@mydata/constants';
import { ProfileService } from '@mydata/services/profile.service';
import { Subscription } from 'rxjs';
import { getUniqueSources, filterData } from '@mydata/utils';
import { ActiveFilter, DataSource, ItemMeta, SortByOption } from 'src/types';
import { PatchService } from '@mydata/services/patch.service';
import { DataSourcesTableComponent } from './data-sources-table/data-sources-table.component';
import { NotificationService } from '@shared/services/notification.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { FieldTypes } from '@mydata/constants/fieldTypes';

@Component({
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit, OnDestroy {
  orcidData: Record<string, unknown>;
  profileData: Record<string, unknown>;

  devFilters = [];
  initialProfileData: any;
  data: any[];
  activeFilters: {};
  parsedActiveFilters: any[];
  activeFiltersDialogConfig: any;
  queryParamsSub: Subscription;
  sortOptions: SortByOption[] = [];
  activeSort: string;
  selectedItems: any[] = [];

  @ViewChild(DataSourcesTableComponent)
  dataSourcesTable: DataSourcesTableComponent;

  locale: string;

  originalKeywords: {
    value: string;
    dataSources: DataSource[];
    itemMeta: ItemMeta;
  }[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public profileService: ProfileService,
    private patchService: PatchService,
    private notificationService: NotificationService,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit(): void {
    this.locale = this.appSettingsService.capitalizedLocale;

    const draftProfile = this.profileService.getDraftProfile();

    /*
     * Inform user if unsaved changes in profile view
     */
    if (draftProfile) {
      this.notificationService.notify({
        notificationText:
          'Sinulla on julkaisemattomia muutoksia profiilinäkymässä.',
        buttons: [
          {
            label: 'Tarkasta muutokset',
            action: () => this.router.navigate(['mydata/profile']),
          },
        ],
      });
    }

    const orcidProfile = this.route.snapshot.data.orcidProfile;
    const myDataProfile = this.route.snapshot.data.myDataProfile;

    this.orcidData = orcidProfile;
    this.profileData = myDataProfile;

    // Filter out required name field which can't be hidden
    const contactGroup = myDataProfile.profileData.find(
      (group) => group.id === 'contact'
    );

    contactGroup.fields = contactGroup.fields.filter(
      (field) => field.id !== 'name'
    );

    // Set original, non-altered profile data.
    // Used in filters.
    this.initialProfileData = myDataProfile.profileData;

    // Initial approach on keywords aims to display all keywords as joined list
    this.handleKeywords(this.initialProfileData);

    // Get active filters from query parameters
    // Match params with filters config that filter keys match
    this.queryParamsSub = this.route.queryParams.subscribe((queryParams) => {
      const filterConfigFields = FiltersConfig.map((item) => item.field);
      const activeFilters = {};

      for (const key of Object.keys(queryParams)) {
        if (
          filterConfigFields.indexOf(key) > -1 &&
          queryParams[key]?.length > 0
        ) {
          activeFilters[key] = queryParams[key];
        }
      }

      this.activeFilters = activeFilters;

      // Single active filter value is presented as string on init.
      // Convert string typed filter value to array so it matches further filtering
      for (const key of Object.keys(activeFilters)) {
        const filter = activeFilters[key];
        if (typeof filter === 'string') {
          activeFilters[key] = [filter];
        }
      }

      // Create data for active filters component
      this.parseActiveFilters(activeFilters);

      // Configuration for displaying active filters list in dialog
      this.activeFiltersDialogConfig = {
        filtersConfig: FiltersConfig,
      };

      this.data =
        Object.keys(activeFilters).length > 0
          ? filterData(myDataProfile.profileData, activeFilters)
          : this.initialProfileData;

      this.activeSort = queryParams.sort;
    });

    this.setSortOptions();
  }

  // Method for displaying keywords as single item.
  // Original values are stored for patch operation.
  handleKeywords = (data) => {
    const descriptionGroup = data.find((group) => group.id === 'description');
    if (descriptionGroup) {
      const keywordsField = descriptionGroup.fields.find(
        (field) => field.id === 'keywords'
      );

      if (keywordsField && keywordsField.items.length) {
        this.originalKeywords = [...keywordsField.items];

        keywordsField.items = [
          {
            value: keywordsField.items
              .map((keyword) => keyword.value)
              .join(', '),
            dataSources: keywordsField.items[0].dataSources,
            itemMeta: keywordsField.items[0].itemMeta,
          },
        ];
      }
    }
  };

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
    this.notificationService.clearNotification();
  }

  // Sort options for sort-by-button component (mobile view only)
  setSortOptions() {
    this.sortOptions = TableColumns.filter((item) => !item.sortDisabled).map(
      (item) => ({
        key: item.key,
        label: item.mobileSortLabel || item.label,
        direction: item.mobileSortDirection,
      })
    );
  }

  // Handle active filters for use of active filters list component
  parseActiveFilters(activeFilters) {
    const statuses = [
      { id: 'public', label: 'Julkinen' },
      { id: 'private', label: 'Ei julkinen' },
    ];

    const datasets = this.initialProfileData
      .flatMap((group) => group.fields)
      .map((field) => ({ id: field.id, label: field.label }));

    const sources = getUniqueSources(
      this.initialProfileData,
      this.appSettingsService.capitalizedLocale
    ).map((source) => ({
      id: source.key,
      label: source.label,
    }));

    const mappedFilters = [...statuses, ...datasets, ...sources];

    this.parsedActiveFilters = [];

    for (const filter of Object.keys(activeFilters)) {
      activeFilters[filter].forEach((activeFilter: string) => {
        this.parsedActiveFilters.push({
          category: filter,
          value: activeFilter,
          translation: mappedFilters.find(
            (filter) => filter.id === activeFilter
          )?.label,
        });
      });
    }
  }

  // Removes single active filter
  removeFilter(filter: ActiveFilter) {
    const queryParams = { ...this.route.snapshot.queryParams };

    /*
     * Angular handles single instance of query param as string.
     * Convert param to array so it matches the case when there's
     * multiple params per category
     */
    if (typeof queryParams[filter.category]) {
      queryParams[filter.category] = [queryParams[filter.category]];
    }

    if (queryParams[filter.category]) {
      queryParams[filter.category] = queryParams[filter.category].filter(
        (item) => item !== filter.value
      );
    }

    this.router.navigate([], { queryParams: queryParams });
  }

  // Clears all active filters
  clearFilters() {
    const clearedQueryParams = {};
    const currentQueryParams = this.route.snapshot.queryParams;
    const active = Object.keys(this.activeFilters);
    const current = Object.keys(currentQueryParams);

    for (const item of current) {
      if (active.indexOf(item) === -1) {
        clearedQueryParams[item] = currentQueryParams[item];
      }
    }

    this.router.navigate([], { queryParams: clearedQueryParams });
  }

  /*
   * Patch payload is recreated on every dialog open.
   * Selection can be toggled and therefore we create payload again on every
   * selection change.
   */
  handleSelection(selectedRows) {
    this.patchService.cancelConfirmedPayload();

    const items = [];

    const filteredGroups = this.data
      .flatMap((group) => group.fields)
      .filter((field) => field.items.length);

    for (const group of filteredGroups) {
      for (const item of group.items) {
        items.push({
          ...item,
          groupLabel: group.label,
          source: item.dataSources
            .map((source) => source.organization['name' + this.locale])
            .join(', '),
        });
      }
    }

    const selection = items.filter(
      (_item, index) => selectedRows.indexOf(index) > -1
    );

    selection.forEach((item) => {
      let payload;

      // Special use case for keywords when keywords are joined and displayed as single item
      if (item.itemMeta.type === FieldTypes.personKeyword) {
        payload = this.originalKeywords.map((item) => ({
          ...item.itemMeta,
          show: !item.itemMeta.show,
        }));
      } else {
        payload = {
          ...item.itemMeta,
          show: !item.itemMeta.show,
        };
      }

      this.patchService.addToPayload(payload);
    });

    this.selectedItems = selection;
  }

  // Update data after succesfull patch operation
  updateData(patchItemsArr) {
    const fields = this.data.flatMap((group) => group.fields);

    fields.forEach((field) => {
      field.items.forEach((item) => {
        const payloadMatch = patchItemsArr.find(
          (patchItem) => patchItem.id === item.itemMeta.id
        );
        if (payloadMatch) {
          item.itemMeta.show = payloadMatch.show;
        }
      });
    });

    this.dataSourcesTable.clearSelections();

    this.profileService.setCurrentProfileData(this.data);
    this.initialProfileData = [...this.data];
  }
}
