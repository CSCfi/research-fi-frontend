//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { get } from 'lodash-es';
import { FieldTypes } from './constants/fieldTypes';

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
    const publicationGroups = data.groupItems;

    const orcidPublications = publicationGroups.find(
      (group) => group.groupMeta.type === FieldTypes.activityOrcidPublication
    );

    const addedPublications = publicationGroups.find(
      (group) => group.groupMeta.type === FieldTypes.activityPublication
    );

    // DOI value is generated from doiHandle field when publication is patched to profile.
    // Therefore find if orcid publication doi string is included in added publications doi field.
    const matchPublication = (addedPublication, orcidPublication) =>
      addedPublication.doi === orcidPublication.doi ||
      addedPublication.doi?.includes(orcidPublication.doi);

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
              organizations: [
                orcidPublications.source.organization,
                addedPublications.source.organization,
              ],
            },
          };

          publicationGroups[0].merged = orcidPublications.items
            .filter((addedPublication) =>
              matchPublication(addedPublication, orcidPublication)
            )
            .map((item) => item.itemMeta);

          // Remove duplicate
          publicationGroups[1].items = addedPublications.items.filter(
            (addedPublication) =>
              !matchPublication(addedPublication, orcidPublication)
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
