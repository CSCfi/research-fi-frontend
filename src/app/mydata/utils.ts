//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { cloneDeep, get } from 'lodash-es';
import { FieldTypes } from './constants/fieldTypes';
import { PatchService } from './services/patch.service';

/*
 * Common pipeable functions
 */
export function checkSelected(group) {
  const itemMetaGroup = [];

  group.groupItems.map((groupItem) =>
    groupItem.items.forEach((item) => itemMetaGroup.push(item.itemMeta))
  );

  // Map fetched publications
  if (group.selectedPublications) {
    group.selectedPublications.forEach((publication) =>
      itemMetaGroup.push({ show: publication.show })
    );
  }

  return itemMetaGroup.some((item) => item.show);
}

// Check if group has a selected item
export function checkGroupSelected(group) {
  return group.items.find((item) => item.itemMeta.show);
}

// Check if group has item in patch items
export function checkGroupPatchItem(group, patchItems) {
  if (Object.keys(group[0]).length > 0 && Object.keys(patchItems[0]).length > 0 && group[0].items !== undefined) {
  const items = group.flatMap((groupItem) => groupItem.items);
  return items.find((item) =>
    patchItems.find(
      (patchItem) => {
        return (patchItem.id === item.itemMeta.id &&
        patchItem.type === item.itemMeta.type)
      }
    )
  );
  }
  return undefined;
}

/*
 * Shared methods
 */

// Get user name from MyData profile data
export function getName(data) {
  return data
    .find((item) => item.id === 'contact')
    .fields[0].groupItems.flatMap((groupItem) => groupItem.items)
    .find((item) => item.itemMeta.show)?.value;
}

// User can add "duplicate" publications.
// Publications from Orcid and Portal are related with DOI.
export function mergePublications(
  data: { groupItems: any },
  patchService: PatchService = null
) {
  if (!isEmptySection(data)) {
    const publicationGroups = data.groupItems;

    const orcidPublications = publicationGroups.find(
      (group) => group.groupMeta.type === FieldTypes.activityOrcidPublication
    );

    const addedPublications = publicationGroups.find(
      (group) => group.groupMeta.type === FieldTypes.activityPublication
    );

    // DOI value is generated from doiHandle field when publication is patched to profile.
    // Therefore find if orcid publication doi string is included in added publications doi field.
    const matchPublication = (
      addedPublication: { doi: string },
      orcidPublication: { doi: string }
    ) =>
      addedPublication.doi === orcidPublication.doi ||
      (orcidPublication.doi.length > 0 &&
        addedPublication.doi?.includes(orcidPublication.doi));

    if (orcidPublications?.length > 0) {
      for (let [i, orcidPublication] of orcidPublications.items.entries()) {
        if (publicationGroups.length === 2) {
          const match = addedPublications.items.find((addedPublication) =>
            matchPublication(addedPublication, orcidPublication)
          );
          if (match) {
            orcidPublications.items[i] = {
              ...orcidPublication,
              ...match,
              title: orcidPublication.title, // Keep title from ORCID
              itemMeta: { ...orcidPublication.itemMeta, show: true }, // Keep original itemMeta, set selection
              merged: true,
              source: {
                // Merged publications have multiple sources
                organizations: [
                  orcidPublications.source.organization,
                  addedPublications.source.organization,
                ],
              },
            };

            // Patch publication from ORCID that has match
            patchService?.addToPayload(orcidPublication.itemMeta);

            // Remove duplicate from added publications
            publicationGroups[1].items = addedPublications.items.filter(
              (addedPublication) =>
                !matchPublication(addedPublication, orcidPublication)
            );
          }
        }
      }
    }
  }
}

// Publications can be empty if user has no imported data from ORCID
export function isEmptySection(data) {
  return !data.groupItems.length;
}

// Sort items and return unbinded data
export function sortItemsByNew(data, path) {
  const dataCopied = [...data.items];
  return dataCopied.sort((a, b) => get(b, path) - get(a, path));
}

// Sort items and return unbinded data
export function sortItemsBy(data, path) {
  const groupItems = data.groupItems;

  groupItems.map(
    (groupItem) =>
      (groupItem.items = groupItem.items.map((item) => ({
        ...item,
        source: groupItem.source,
      })))
  );

  const items = [...groupItems].flatMap((groupItem) => groupItem.items);

  return items.sort((a, b) => get(b, path) - get(a, path));
}

// Map uniques sources from all groups
export function getUniqueSources(profileData) {
  const sources = [];

  const sourcesMap = profileData
    .flatMap((group) => group.fields)
    .flatMap((field) => field.groupItems)
    .map((groupItem) => groupItem.source);

  const uniqueOrganizations = [
    ...new Set(sourcesMap.map((source) => source.organization.name)),
  ];

  for (const organization of uniqueOrganizations) {
    sources.push({
      label: organization,
      id: sourcesMap.find((source) => source.organization.name === organization)
        .id,
      count: sourcesMap.filter(
        (source) => source.organization.name === organization
      ).length,
    });
  }

  return sources;
}

/*
 * Data sources filters
 *
 * Each filter category handles filtered items differently and therefore
 * it's not sufficient to filter data just once in the parent component.
 *
 * Filters component handles data per category, e.g. checking filter in "status"
 * category filters results in other categories but not in "status".
 * This results in accurate item counts and enables more performative filtering.
 *
 * Table component filtering is more simple and filters only rows to display.
 */
export const filterData = (profileData, activeFilters, filterType?: string) => {
  const statusFilter = activeFilters.status;
  const datasetFilter = activeFilters.dataset;
  const sourceFilter = activeFilters.source;

  const groups = cloneDeep(profileData);

  /*
   * Rule for checking if filtering is done to a certain category.
   * This happens in filters component where each filter category counts
   * filtered items bit differently regarding of filter category.
   * Filtering doesn't happen for given filterType in given category.
   */
  const checkCategoryFilter = (category: string, filter) =>
    (category && category !== filterType && filter) || (!filterType && filter);

  for (const group of groups) {
    // Datasets
    if (checkCategoryFilter('dataset', datasetFilter)) {
      filterByDatasets(group, datasetFilter);
    }
    for (const field of group.fields) {
      for (const groupItem of field.groupItems) {
        // Publicity
        if (checkCategoryFilter('status', statusFilter)) {
          filterByStatus(groupItem, statusFilter);
        }
      }
      // Source
      if (checkCategoryFilter('source', sourceFilter)) {
        filterBySource(field, sourceFilter);
      }
    }
  }

  return groups;
};

export function filterByStatus(groupItem, filter) {
  const statusFilterOptions = { public: true, private: false };
  groupItem.items = groupItem.items.filter((item) =>
    filter.some(
      (filter: string) => item.itemMeta.show === statusFilterOptions[filter]
    )
  );
}

export function filterByDatasets(group, filter) {
  return (group.fields = group.fields.filter((field) =>
    filter.find((filter) => filter === field.id)
  ));
}

export function filterBySource(field, filter) {
  field.groupItems = field.groupItems.filter((groupItem) =>
    filter.some(
      (filter: string) => groupItem.source.organization.name === filter
    )
  );
}
