//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FiltersConfig } from '@mydata/constants';
import { getUniqueSources, filterData } from '@mydata/utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-sources-filters',
  templateUrl: './data-sources-filters.component.html',
  styleUrls: ['./data-sources-filters.component.scss'],
})

/*
 * This component uses filters-component from Portal to render filters with shared
 * styles. Filtering happens locally and therefore we don't reuse filtering logic from
 * shared filters component.
 */
export class DataSourcesFiltersComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() profileData: any;
  @Input() activeFilters: {
    status?: string[];
    dataset?: string[];
    source?: string[];
  };

  filters: any;
  filtersConfig = FiltersConfig;
  queryParamSub: Subscription;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.createFilterData(this.profileData);
  }

  createFilterData(profileData) {
    // Filter out empty groups and flatten fields
    const filterEmptyGroups = (data: any[]) =>
      data
        .flatMap((group) => group.fields)
        .filter((group) => group.groupItems.length);

    /*
     * Method for listing all profile items as non grouped version,
     * which gives easier access to e.g. publicity value
     */
    const flattenItems = (groups) =>
      groups
        .flatMap((group) => group.groupItems)
        .flatMap((groupItems) => groupItems.items);

    const handleDataFilter = (category: string) =>
      filterData(profileData, this.activeFilters, category);

    // JSON structure mimics the one we got in Portal from Elasticsearch
    const filters = {
      aggregations: {
        status: {
          buckets: [
            {
              key: 'public',
              label: 'Julkinen',
              doc_count: flattenItems(
                filterEmptyGroups(handleDataFilter('status'))
              ).filter((item) => item.itemMeta.show).length,
            },
            {
              key: 'private',
              label: 'Ei julkinen',
              doc_count: flattenItems(
                filterEmptyGroups(handleDataFilter('status'))
              ).filter((item) => !item.itemMeta.show).length,
            },
          ],
        },
        dataset: {
          buckets: filterEmptyGroups(handleDataFilter('dataset')).map(
            (group) => {
              return {
                key: group.id,
                label: group.label,
                doc_count: group.groupItems.flatMap((group) => group.items)
                  .length,
              };
            }
          ),
        },
        source: {
          buckets: getUniqueSources(handleDataFilter('source')).map(
            (organization) => {
              return {
                key: organization.label,
                label: organization.label,
                doc_count: organization.count,
              };
            }
          ),
        },
      },
    };

    // Hide empty filters
    for (const filter of Object.keys(filters.aggregations)) {
      let buckets = filters.aggregations[filter].buckets;
      filters.aggregations[filter].buckets = buckets.filter(
        (item) => item.doc_count > 0
      );
    }

    this.filters = filters;
  }

  ngOnDestroy(): void {
    this.queryParamSub?.unsubscribe();
  }
}
