import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasSelectedItems'
})
export class HasSelectedItemsPipe implements PipeTransform {
  transform(group: any,
            extras: { groupId: string }): boolean {

    let someSelected = false;
    if (group.length) {
      group.forEach(subgroup => {
        if (extras?.groupId) {
          subgroup.groupItems.forEach((item) => {
            if (subgroup.id === extras.groupId && item?.items?.some(item => item.itemMeta.show)) {
              someSelected = true;
            }
          });
        } else {
          subgroup.groupItems.forEach((item) => {
            if (item?.items?.some(item => item.itemMeta.show)) {
              someSelected = true;
            }
          });
        }
      });
    }
    return someSelected;
  }
}
