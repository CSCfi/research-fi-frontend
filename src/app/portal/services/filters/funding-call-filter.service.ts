import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FundingCallFilterService {
  filterData = [
    // {
    //   field: 'year',
    //   label: $localize`:@@fundingYear:Aloitusvuosi`,
    //   hasSubFields: false,
    //   open: true,
    //   limitHeight: true,
    //   hideSearch: true,
    //   tooltip: $localize`:@@iYearFTooltip:Tutkimusinfrastruktuurin toiminnan aloitusvuosi. Jos aloitusvuosi ei ole tiedossa, käytetään vuotta jolloin tiedot on toimitettu tiedejatutkimus.fi-palveluun.`,
    // },
    {
      field: 'field',
      label: $localize`:@@fundingCallCategory:Hakuala`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
    },
    {
      field: 'organization',
      label: $localize`:@@funder:Rahoittaja`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
    },
  ];

  singleFilterData = [];


  constructor() {}

  shapeData(data) {
    const source = data.aggregations;
    // Organization
    this.organization(source.organization);
    // Field of science
    source.field = this.field(source.field.field);
    source.shaped = true;
    return source;
  }

  organization(data) {
    data.buckets = data.orgId.buckets;
    data.buckets.forEach((item) => {
      item.id = item.key;
      item.label = item.orgName.buckets[0]?.key;
      item.doc_count = item.orgName.buckets[0]?.doc_count;
    });
    // Sort by number of docs
    data.buckets.sort((a, b) => b.doc_count - a.doc_count);
  }
  
  field(data) {
    data.buckets.map((item) => {
      item.label = item.key;
      item.key = item.fieldId.buckets[0]?.key;
      item.id = item.key;
      item.doc_count = item.filtered.filterCount.doc_count;
    });
    // Sort by category name
    data.buckets.sort((a, b) => +(a.label > b.label) - 0.5);

    // Add extra field for active-filters
    const cp = cloneDeep(data.buckets);
    cp.forEach(f => f.key = f.label);
    data.fields = {buckets: cp};

    return data;
  }
} 
