import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasFetchedItem',
})
export class HasFetchedItemPipe implements PipeTransform {
  transform(items: any[]): boolean {
    return !!items.find(
      (item: { itemMeta: { primaryValue: any } }) => item.itemMeta.primaryValue
    );
  }
}
