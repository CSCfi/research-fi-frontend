import { Pipe, PipeTransform } from '@angular/core';
import { cloneDeep } from 'lodash-es';

@Pipe({
  name: 'formatAndSortTimespan',
  standalone: true
})
export class FormatAndSortTimespanPipe implements PipeTransform {
  transform(data: any, dataType: string): unknown {

    if (data?.items) {
      const sorted = cloneDeep(data);
      sorted.items = sorted.items.sort(customSort);

      sorted.items = sorted.items.map(item => {
        // Show single year
        if (item.startDate.year === item.endDate.year) {
          if (item.endDate.year === 0) {
            item.timing = 'unknown - present';
          } else {
            item.timing = item.startDate.year;
          }
        }
        // Start date missing
        else if (item.startDate.year === 0) {
          if (item.endDate.year > 0) {
            item.timing = 'unknown' + ' - ' + item.endDate.year;
          }
          // Start and end date missing
          else {
            item.timing = '';
          }
          // End date missing
        } else if (item.endDate.year === 0) {
          item.timing = item.startDate.year + ' - ' + 'present';
        }
        // Regular case
        else {
          item.timing = item.startDate.year + ' - ' + item.endDate.year;
        }
        return item;
      });
      return sorted;
    }
  }
}

function customSort(a, b) {
  // Return comparison in reversed order
  if (a.endDate.year === 0 && b.endDate.year === 0) {
    // Both are missing end years, so sort by start year
    return a.startDate.year > b.startDate.year ? -1 : a.startDate.year < b.startDate.year ? 1 : 0;
  }
  if (a.endDate.year > 0 && b.endDate.year > 0) {
    // Both have end years
    return a.endDate.year > b.endDate.year ? -1 : a.endDate.year < b.endDate.year ? 1 : 0;
  }
  // Other end year is present
  else if (a.endDate.year > 0) {
    // B is "present day" (bigger)
    return 1;
  } // A is "present day" (bigger)
  else return -1;
}



