import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DatasetFilterService {
  filterData = [
    {
      field: 'year',
      label: $localize`:@@publicationYear:Aloitusvuosi`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: true,
      tooltip: '',
    },
    {
      field: 'dataSource',
      label: $localize`:@@datasetSource:Tietolähde`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: false,
      tooltip: '',
    },
  ];

  singleFilterData = [];

  constructor() {}

  shapeData(data) {
    const source = data.aggregations;
    source.year.buckets = this.mapYear(source.year.years.buckets);
    source.dataSource.buckets = this.filterEmptyKeys(source.dataSource.dataSources.buckets);
    source.shaped = true;
    return source;
  }

  filterEmptyKeys(arr) {
    return arr.filter((item) => item.key !== ' ');
  }

  mapYear(data) {
    const clone = cloneDeep(data);
    clone.map((item) => {
      item.key = item.key.toString();
    });
    return clone;
  }
}
