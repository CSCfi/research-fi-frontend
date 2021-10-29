//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { get } from 'lodash-es';

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
export function checkGroupPatchItem(group, patchItemIds) {
  const items = group.flatMap((groupItem) => groupItem.items);
  return items.find((item) => patchItemIds.includes(item.itemMeta.id));
}

/*
 * Shared methods
 */
export function getDataSources(profileData, locale: string = 'Fi') {
  // Remove default locale when app is localized
  const mapDataSources = (data) => {
    return data
      .map((item) => item.fields)
      .filter((field) => field.length)
      .flat()
      .map((field) => field.groupItems)
      .flat()
      .map((field) => field.source && field.source.organization)
      .filter((field) => field);
  };

  return [
    ...new Map(
      mapDataSources(profileData).map((item) => [item['name' + locale], item])
    ).values(),
  ].map((item) => item['name' + locale]);
}

export function mergePublications(data) {
  if (!isEmptySection(data)) {
    const publications = data.fields[0].groupItems;

    for (let [i, publication] of publications[0].items.entries()) {
      if (publications.length === 2) {
        const match = publications[1].items.find(
          (item) => item.doi === publication.doi
        );

        if (match) {
          publications[0].items[i] = {
            ...publication,
            merged: true,
            source: {
              organizations: [
                publications[0].source.organization,
                publications[1].source.organization,
              ],
            },
          };

          // Remove duplicate
          publications[1].items = publications[1].items.filter(
            (item) => item.doi !== publication.doi
          );
        }
        // else {
        //   for (const group of publications.shift()) {
        //     if (group.items.find((item) => item.doi === publication.doi)) {
        //     }
        //   }
        // }
      }
    }
  }
}

// Publications can be empty if user has no imported data from ORCID
export function isEmptySection(data) {
  return !data.fields[0].groupItems.length;
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
