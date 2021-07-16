import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countGroupItems',
})
export class CountGroupItemsPipe implements PipeTransform {
  transform(group: any, filterSelected?: boolean) {
    const combinedItems = [];

    group.forEach((item) => {
      item.groupItems.map((groupItem) =>
        groupItem.items.forEach((item) => combinedItems.push(item.itemMeta))
      );

      // Check for fetched publications
      if (item.selectedPublications) {
        item.selectedPublications.forEach((publication) =>
          combinedItems.push({ show: publication.show })
        );
      }
    });

    return filterSelected
      ? combinedItems.filter((item) => item.show)
      : combinedItems;
  }
}
