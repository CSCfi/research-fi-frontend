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
import { getUniqueSources, filterData, getName } from '@mydata/utils';
import { ActiveFilter, DataSource, ItemMeta, SortByOption } from 'src/types';
import { PatchService } from '@mydata/services/patch.service';
import { DataSourcesTableComponent } from './data-sources-table/data-sources-table.component';
import { NotificationService } from '@shared/services/notification.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { clone, cloneDeep } from 'lodash-es';
import { DataSourcesSelectionActionsComponent } from './data-sources-selection-actions/data-sources-selection-actions.component';
import { ActiveFiltersListComponent } from '../../../../shared/components/active-filters-list/active-filters-list.component';
import { SortByButtonComponent } from '../../../../shared/components/buttons/sort-by-button/sort-by-button.component';
import { DataSourcesFiltersComponent } from './data-sources-filters/data-sources-filters.component';
import { NgTemplateOutlet, NgIf } from '@angular/common';
import { BannerDividerComponent } from '@shared/components/banner-divider/banner-divider.component';

@Component({
    selector: 'app-data-sources',
    templateUrl: './data-sources.component.html',
    styleUrls: ['./data-sources.component.scss'],
    standalone: true,
  imports: [
    NgTemplateOutlet,
    DataSourcesFiltersComponent,
    SortByButtonComponent,
    NgIf,
    ActiveFiltersListComponent,
    DataSourcesTableComponent,
    DataSourcesSelectionActionsComponent,
    BannerDividerComponent
  ]
})
export class DataSourcesComponent implements OnInit, OnDestroy {
  orcidData: Record<string, unknown>;
  profileData: Record<string, unknown>;

  devFilters = [];
  initialProfileData: any;
  visibleData: any[];
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
  nameField: any;

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
        notificationText: $localize`:@@youHaveUnpublishedChangesSnackbar:Sinulla on julkaisemattomia muutoksia profiilinäkymässä.`,
        buttons: [
          {
            label: $localize`:@@youHaveUnpublishedChangesSnackbarButton:Tarkasta muutokset.`,
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

    // Name field needs to be replaced when storing data into service
    this.nameField = contactGroup.fields.filter(
      (field) => field.id === 'name'
    )[0];


    // Set original, non-altered profile data.
    // Used in filters.
    this.initialProfileData = myDataProfile.profileData;

    // Initial approach on keywords aims to display all keywords as joined list
    this.storeOriginalKeywords(this.initialProfileData);

    // Get active filters from query parameters
    // Match params with filters config that filter keys match
    this.queryParamsSub = this.route.queryParams.subscribe((queryParams) => {
      this.doFiltering(queryParams)
    });
    this.setSortOptions();
  }

  doFiltering(queryParams: any){
    {
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

      // This is used in model
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

      this.visibleData =
        Object.keys(activeFilters).length > 0
          ? filterData(this.initialProfileData, activeFilters)
          : this.initialProfileData;
      this.activeSort = queryParams.sort;
    }
  }

  async reloadProfileData(activeFilters: any) {
    this.profileService
      .getProfileData()
      .then(
        (value) => {
          if (value) {
            this.profileService.setCurrentProfileData(
              cloneDeep(value.profileData)
            );
            this.initialProfileData = clone(value.profileData);
            //this.visibleData = cloneDeep(value.profileData);
            this.storeOriginalKeywords(this.initialProfileData);
            this.clearFilters();
          }
        });
  }

  // Method for displaying keywords as single item.
  // Original values are stored for patch operation.
  storeOriginalKeywords = (data) => {
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
      { id: 'public', label: $localize`:@@public:Julkinen` },
      { id: 'private', label: $localize`:@@notPublic:Ei julkinen` },
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
    if (typeof queryParams[filter.category] === 'string') {
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
    selectedRows = selectedRows.map((row) => {
      return row.toString();
    });

    // Reset previous selection
    this.patchService.patchItems = [];
    this.patchService.cancelConfirmedPayload();

    const items = [];

    const filteredGroups = this.initialProfileData
      .flatMap((group) => group.fields)
      .filter((field) => field.items.length);

    for (const group of filteredGroups) {
      for (const item of group.items) {
        items.push({
          ...item,
          groupLabel: group.label,
          source: item.dataSources
            ?.map((source) => source.organization['name' + this.locale])
            .join(', '),
        });
      }
    }

    const selection = items.filter(
      (item) => {
        return selectedRows.includes(item.itemMeta.temporaryUniqueId.toString());
      }
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

  // Update data after successful patch operation
  updateData(patchItemsArr) {
    const fields = this.visibleData.flatMap((group) => group.fields);

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

    // Add name field back to data which is stored in state
    const dataToStore = cloneDeep(this.visibleData);

    let contactGroup = dataToStore.find((group) => group.id === 'contact');

    contactGroup.fields.unshift(this.nameField);

    this.profileService.setCurrentProfileData(dataToStore);
    this.initialProfileData = dataToStore;
    this.reloadProfileData(null);
  }
}
