import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countSelectedItems',
  standalone: true
})
export class CountSelectedItemsPipe implements PipeTransform {
  transform(data: any): number {
    let count = 0;
    if (data?.length) {
       data.forEach((group) => group.items.find((el) => {
        if (el.itemMeta.show){
          count += 1;
        }
      }));
    } else if (data?.items) {
      data.items.forEach((item) => {
        if (item?.itemMeta?.show) {
          count += 1;
        }
      });
    }
    return count;
  }

}