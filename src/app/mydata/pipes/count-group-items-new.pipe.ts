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
    extras: { filterSelected: boolean; patchItems: any[] }
  ) {
    let combinedItems = [];

    if (group.length) {
      group.forEach(subgroup => {
        extras?.filterSelected ? combinedItems.push(subgroup.groupItems[0]?.items) :
        combinedItems.push(subgroup.groupItems[0]?.items?.filter(item => item.itemMeta.show).map(visibleItem => {
          return visibleItem.itemMeta;
        }));
      });
    }

    let ret2 = [];
    combinedItems[0] && extras?.filterSelected
      ? combinedItems.filter((item) =>
        extras.patchItems
          ?
          extras.patchItems.find(
            (patchItem) => {
              item.forEach((subItem) => {
                patchItem.id === subItem.itemMeta.id && patchItem.type === subItem.itemMeta.type
                if(patchItem.id === subItem.itemMeta.id && patchItem.type === subItem.itemMeta.type){
                  ret2.push(subItem);
                }
              });
            }
          )
          : item.show
      )
      : combinedItems;
    return ret2;
  }
}
