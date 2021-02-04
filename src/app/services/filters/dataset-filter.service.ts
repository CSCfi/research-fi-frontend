import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DatasetFilterService {
  filterData = [
    {
      field: 'year',
      label: $localize`:@@publicationYear:Julkaisuvuosi`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: true,
      tooltip: '',
    },
    {
      field: 'organization',
      label: $localize`:@@organization:Organisaatio`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
      hideSearch: false,
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
    source.organization = this.organization(source.organization);
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

  organization(data) {
    const source = cloneDeep(data) || [];
    source.buckets = source.sectorName ? source.sectorName.buckets : [];
    source.buckets.forEach((item) => {
      item.subData = item.org.buckets.filter(
        (x) => x.doc_count > 0
      );
      item.subData.map((subItem) => {
        subItem.label = subItem.label || subItem.key;
        subItem.key = subItem.orgId.buckets[0].key;
        subItem.doc_count = subItem.doc_count;
      });
      item.doc_count = item.subData
        .map((s) => s.doc_count)
        .reduce((a, b) => a + b, 0);
    });
    return source;
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
