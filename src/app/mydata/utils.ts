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
export function checkGroupPatchItem(group, patchItems) {
  const items = group.flatMap((groupItem) => groupItem.items);
  return items.find((item) =>
    patchItems.find(
      (patchItem) =>
        patchItem.id === item.itemMeta.id &&
        patchItem.type === item.itemMeta.type
    )
  );
}

/*
 * Shared methods
 */

// User can add "duplicate" publications.
// Publications from Orcid and Portal are related with DOI.
export function mergePublications(data) {
  if (!isEmptySection(data)) {
    const publications = data.groupItems;
    for (let [i, publication] of publications[0].items.entries()) {
      if (publications.length === 2) {
        const match = publications[1].items.find(
          (item) => item.doi === publication.doi
        );
        if (match) {
          publications[0].items[i] = {
            ...publication,
            ...match,
            title: publication.title, // Keep title from ORCID
            itemMeta: { ...publication.itemMeta, show: true }, // Keep original itemMeta
            merged: true,
            source: {
              organizations: [
                publications[0].source.organization,
                publications[1].source.organization,
              ],
            },
          };

          publications[0].merged = publications[0].items
            .filter((item) => item.doi === publication.doi)
            .map((item) => item.itemMeta);

          // Remove duplicate
          publications[1].items = publications[1].items.filter(
            (item) => item.doi !== publication.doi
          );
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
