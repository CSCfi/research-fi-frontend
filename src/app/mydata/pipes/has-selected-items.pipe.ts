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
        // Direct affiliation subgroup. Used for group caption.
        if (subgroup?.itemMeta?.show && extras?.groupId === 'affiliation') {
          someSelected = true;
        }
        // Direct subgroup
        else if (subgroup?.itemMeta?.show) {
          someSelected = true;
        }

        // Named groupItems group
        if (extras?.groupId && subgroup?.groupItems) {
          subgroup.groupItems.forEach((item) => {
            if (subgroup.id === extras.groupId && item?.items?.some(item => item.itemMeta.show)) {
              someSelected = true;
            }
          });
        }
        // Unnamed groupItems group
        else if (subgroup?.groupItems){
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
