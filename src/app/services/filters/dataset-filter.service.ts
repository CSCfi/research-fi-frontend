import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { StaticDataService } from '../static-data.service';
import { FilterMethodService } from './filter-method.service';

@Injectable({
  providedIn: 'root',
})
export class DatasetFilterService {
  filterData = [
    {
      field: 'year',
      label: $localize`:@@yearOfPublication:Julkaisuvuosi`,
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
      field: 'field',
      label: $localize`:@@fieldOfScience:Tieteenala`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
      hideSearch: false,
      tooltip: '',
    },
    {
      field: 'accessType',
      label: $localize`:@@datasetAccess:Saatavuus`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: false,
      tooltip: '',
    },
  ];

  singleFilterData = [];

  constructor(private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
    const source = data.aggregations;
    source.year.buckets = this.mapYear(source.year.years.buckets);
    source.organization = this.organization(source.organization);
    source.dataSource.buckets = this.filterEmptyKeys(source.dataSource.dataSources.buckets);
    
    source.field.buckets = this.minorField(
      source.field.fields.buckets.filter(
        (item) => item.doc_count > 0
      )
    );

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

  minorField(data) {
    if (data.length) {
      // check if major aggregation is available
      const combinedMajorFields = data.length
        ? this.filterMethodService.separateMinor(data ? data : [], 'dataset')
        : [];

      const result = cloneDeep(this.staticDataService.majorFieldsOfScience);

      for (let i = 0; i < combinedMajorFields.length; i++) {
        if (result[i]) {
          result[i].subData = combinedMajorFields[i];
          // Add doc counts to major fields of science
          result[i].doc_count = result[i].subData
            .map((x) => x.doc_count)
            .reduce((a, b) => a + b, 0);
        }
      }

      return [...result.filter((item) => item.subData.length > 0)];
    }
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
