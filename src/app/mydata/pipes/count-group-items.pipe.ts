// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countGroupItems',
  pure: false,
})

/*
 * Count items in groups. Some items, Eg. single selections and joined items need to be handled differently.
 */
export class CountGroupItemsPipe implements PipeTransform {
  transform(
    group: any,
    extras: { filterSelected: boolean; patchItems: any[] }
  ) {
    let combinedItems = [];

    group.forEach((el) => {
      el.groupItems.map((groupItem) => {
        if (groupItem.items.length > 0) {
          switch (true) {
            case el.single: {
              combinedItems = combinedItems.concat(
                groupItem.items
                  .map((item) => item.itemMeta)
                  .filter((item) => item.show)
              );
              break;
            }
            case el.joined: {
              combinedItems.push(groupItem.items[0].itemMeta);
              break;
            }
            default: {
              combinedItems = combinedItems.concat(
                groupItem.items.map((item) => item.itemMeta)
              );
            }
          }
        }
      });

      // Check for fetched publications
      if (el.selectedPublications) {
        el.selectedPublications.forEach((publication) =>
          combinedItems.push({ show: publication.itemMeta.show })
        );
      }
    });

    return extras?.filterSelected
      ? combinedItems.filter((item) =>
        extras.patchItems
          ? // ? extras.patchItemIds.includes(item.id)
          extras.patchItems.find(
            (patchItem) =>
              patchItem.id === item.id && patchItem.type === item.type
          )
          : item.show
      )
      : combinedItems;
  }
}
