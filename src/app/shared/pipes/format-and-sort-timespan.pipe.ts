import { Pipe, PipeTransform } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { GroupTypes } from '@mydata/constants/groupTypes';


@Pipe({
  name: 'formatAndSortTimespan',
  standalone: true
})


export class FormatAndSortTimespanPipe implements PipeTransform {
  protected readonly groupTypes = GroupTypes;
  transform(data: any, dataType: string): unknown {

    const presentLocalization = $localize`:@@present:nykyhetki`;

    if (data?.items) {
      const sorted = cloneDeep(data);

      if (dataType === this.groupTypes.funding) {
        sorted.items = sorted.items.map(item => {
          item.startDate = {year: item.startYear ? item.startYear : 0};
          item.endDate = {year: item.endYear ? item.endYear : 0};
          return item;
        });
      }

      sorted.items = sorted.items.sort(customSort);

      sorted.items = sorted.items.map(item => {
        // Show single year
        if (item.startDate.year === item.endDate.year) {
          if (item.endDate.year === 0) {
            item.timing = '';
          } else {
            item.timing = item.startDate.year.toString();
          }
        }
        // Start date missing
        else if (item.startDate.year === 0) {
          if (item.endDate.year > 0) {
            item.timing = item.endDate.year.toString();
          }
          // Start and end date missing
          else {
            item.timing = '';
          }
          // End date missing
        } else if (item.endDate.year === 0) {
          dataType === this.groupTypes.activitiesAndRewards ? item.timing = item.startDate.year?.toString() : item.timing = item.startDate.year + ' - ' + presentLocalization;
          dataType === this.groupTypes.funding ? item.timing = item.startDate.year?.toString() : undefined;
          dataType === this.groupTypes.funding ? item.year = item.startDate.year?.toString() : undefined;
        }
        // Regular case
        else {
          item.timing = item.startDate.year + ' - ' + item.endDate.year;
        }
        return item;
      });

      // Sort items with empty timing to last
      const timingExists = [];
      const noTiming = [];
      sorted.items.forEach(item => {
        if (item.timing === '') {
          noTiming.push(item);
        }
        else {
          timingExists.push(item);
        }
      });
      sorted.items = timingExists.concat(noTiming);
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



