// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'countFieldItems',
    pure: false,
    standalone: true,
})

/*
 * Count items in groups. Some items, Eg. single selections and joined items need to be handled differently.
 */
export class countFieldItemsPipe implements PipeTransform {
  transform(
    group: any,
    extras: { filterSelected: boolean; patchItems: any[]; onlyCount: boolean }
  ) {
    let combinedItems = [];

    if (group.length) {
      group.forEach((subgroup) => {
        if (subgroup.joined) {
          subgroup.items.map((item) => (item.joined = true));
        }
        extras?.filterSelected
          ? combinedItems.push(subgroup.items)
          : combinedItems.push(
              subgroup.items
                ?.filter((item) => item.itemMeta.show)
                .map((visibleItem) => {
                  return visibleItem.itemMeta;
                })
            );
      });
    }

    let ret = [];
    combinedItems[0] && extras?.filterSelected
      ? combinedItems.filter((item) =>
          extras.patchItems
            ? extras.patchItems.find((patchItem) => {
                item.forEach((subItem) => {
                  patchItem.id === subItem.itemMeta.id &&
                    patchItem.type === subItem.itemMeta.type;
                  if (
                    patchItem.id === subItem.itemMeta.id &&
                    patchItem.type === subItem.itemMeta.type
                  ) {
                    ret.push(subItem);
                  }
                });
              })
            : item.show
        )
      : combinedItems;

    // Called 'only count' since crops out information. Used only for counting number of changed items.
    // E.g. count keywords from one source as one item
    if (extras.onlyCount) {
      if (ret.length > 1) {
        let prevItem = ret[0];
        ret.forEach((item) => {
          if (item.joined && prevItem?.itemMeta?.type === item.itemMeta.type) {
            prevItem = item;
            ret.shift();
          }
        });
      }
    }
    return ret;
  }
}
