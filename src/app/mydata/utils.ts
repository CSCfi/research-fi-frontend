//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

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
      .map((field) => field.source.organization);
  };

  return [
    ...new Map(
      mapDataSources(profileData).map((item) => [item['name' + locale], item])
    ).values(),
  ].map((item) => item['name' + locale]);
}
