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
    {
      field: 'accessType',
      label: $localize`:@@availability:Saatavuus`,
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
    source.accessType.buckets = this.accessType(source.accessType.accessTypes.buckets);
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

  accessType(data) {
    data.forEach(type => {
      switch (type.key) {
        case 'open': {
          type.label = $localize`:@@datasetAccessOpen:Avoin`;
          break;
        }
        case 'permit': {
          type.label = $localize`:@@datasetAccessPermit:Vaatii luvan hakemista Fairdata-palvelussa`;
          break;
        }
        case 'login': {
          type.label = $localize`:@@datasetAccessLogin:Vaatii kirjautumisen Fairdata-palvelussa`;
          break;
        }
        case 'restricted': {
          type.label = $localize`:@@datasetAccessRestricted:Saatavuutta rajoitettu`;
          break;
        }
        case 'embargo': {
          type.label = $localize`:@@datasetAccessEmbargo:Embargo`;
          break;
        }
      }
    })
    return data;
  }
}
