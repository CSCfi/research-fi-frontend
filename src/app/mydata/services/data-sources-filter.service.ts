//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataSourcesFilterService {
  filterData = [
    {
      field: 'organization',
      label: $localize`:@@organization:Organisaatio`,
      hasSubFields: true,
      open: true,
      limitHeight: true,
    },
  ];

  constructor() {}

  shapeData(data) {
    const source = data.aggregations;
    source.organization.buckets = this.organization(
      source.organization.buckets
    );
    source.shaped = true;
    return source;
  }

  organization(data) {
    // Sort by sector id
    data.sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10));
    // Set sub items
    data.forEach((item) => {
      item.key = item.sectorName.buckets[0].key.trim();
      item.subData = item.orgName.buckets;
      item.subData.map((subItem) => {
        subItem.label = subItem.key.trim();
        subItem.key = subItem.orgId.buckets[0].key;
        subItem.doc_count = subItem.doc_count;
      });
    });
    const result = data;
    return result;
  }
}
