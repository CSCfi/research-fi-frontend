import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasSelectedItems',
})
export class HasSelectedItemsPipe implements PipeTransform {
  transform(group: any): boolean {
    let someSelected = false;
    if (group.length) {
      group.forEach(subgroup => {
        subgroup.groupItems.forEach((item) => {
          if (item?.items?.some(item => item.itemMeta.show)){
            someSelected = true;
          }
        });
      });
    }
    return someSelected;
  }
}
