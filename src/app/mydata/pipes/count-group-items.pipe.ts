import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countGroupItems',
})
export class CountGroupItemsPipe implements PipeTransform {
  transform(group: any, filterSelected?: boolean) {
    const combinedItems = [];

    group.forEach((el) => {
      el.groupItems.map((groupItem) =>
        groupItem.items.forEach((item) =>
          el.single
            ? item.itemMeta.show === true
              ? combinedItems.push(item.itemMeta)
              : null
            : combinedItems.push(item.itemMeta)
        )
      );

      // Check for fetched publications
      if (el.selectedPublications) {
        el.selectedPublications.forEach((publication) =>
          combinedItems.push({ show: publication.show })
        );
      }
    });

    return filterSelected
      ? combinedItems.filter((item) => item.show)
      : combinedItems;
  }
}
