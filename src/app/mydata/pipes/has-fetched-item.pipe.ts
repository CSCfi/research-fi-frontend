import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasFetchedItem',
})
export class HasFetchedItemPipe implements PipeTransform {
  transform(group: { items: any[] }): boolean {
    return !!group.items.find(
      (item: { itemMeta: { primaryValue: any } }) => item.itemMeta.primaryValue
    );
  }
}
