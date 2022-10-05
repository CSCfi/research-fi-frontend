// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countGroupItemsNew',
  pure: false,
})

/*
 * Count items in groups. Some items, Eg. single selections and joined items need to be handled differently.
 */
export class CountGroupItemsNewPipe implements PipeTransform {
  transform(
    group: any,
    extras: { filterSelected: boolean; patchItems: any[]; onlyCount: boolean }
  ) {
    let combinedItems = [];

    if (group.length) {
      group.forEach(subgroup => {
        if (subgroup.joined) {
          subgroup.groupItems[0].items.map((item) => item.joined = true);
        }
          extras?.filterSelected ? combinedItems.push(subgroup.groupItems[0]?.items) :
            combinedItems.push(subgroup.groupItems[0]?.items?.filter(item => item.itemMeta.show).map(visibleItem => {
              return visibleItem.itemMeta;
            }));

      });
    }

    let ret = [];
    combinedItems[0] && extras?.filterSelected
      ? combinedItems.filter((item) =>
        extras.patchItems
          ?
          extras.patchItems.find(
            (patchItem) => {
              item.forEach((subItem) => {
                patchItem.id === subItem.itemMeta.id && patchItem.type === subItem.itemMeta.type
                if (patchItem.id === subItem.itemMeta.id && patchItem.type === subItem.itemMeta.type){
                  ret.push(subItem);
                }
              });
            }
          )
          : item.show
      )
      : combinedItems;

    // Called 'only count' since crops out information. Used only for counting number of changed items.
    if (extras.onlyCount) {
      let prevItem = ret[0];
      ret.forEach((item) => {
        if (item.joined && prevItem?.itemMeta?.type === item.itemMeta.type) {
          prevItem = item;
          ret.shift();
        }
      });
    }
    return ret;
  }
}
