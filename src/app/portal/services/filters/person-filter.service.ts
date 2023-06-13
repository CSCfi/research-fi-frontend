//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class PersonFilterService {
  filterData = [
    {
      field: 'organization',
      label: $localize`:@@organization:Organisaatio`,
      hasSubFields: true,
      open: true,
      limitHeight: false,
    },
    {
      field: 'keyword',
      label: $localize`:@@keywordsFilter:Avainsanat`,
      hasSubFields: false,
      open: true,
      limitHeight: false,
    },
    {
      field: 'position',
      label: $localize`:@@positionFilter:Nimike`,
      hasSubFields: false,
      open: true,
      limitHeight: false,
    },
  ];

  singleFilterData = [];

  constructor() {}

  shapeData(data) {
    const source = data.aggregations;

    source.organization = this.mapOrganizations(source.organization);
    source.keyword.buckets = this.mapKeywords(source.keyword);
    source.position.buckets = this.mapPosition(source.position);
    source.shaped = true;

    return source;
  }

  mapOrganizations(data) {
    const source = cloneDeep(data) || [];

    source.buckets = source.sectorName ? source.sectorName.buckets : [];
    source.buckets.forEach((item) => {
      item.subData = item.org.organization.buckets.filter(
        (x) => x.filtered.filterCount.doc_count > 0 && x.key.trim().length > 0
      );
      item.subData.map((subItem) => {
        subItem.label = subItem.label || subItem.key;
        subItem.key = subItem.orgId.buckets[0]?.key;
        subItem.doc_count = subItem.filtered.filterCount.doc_count;
      });
      item.doc_count = item.subData
        .map((s) => s.doc_count)
        .reduce((a, b) => a + b, 0);
    });

    // Sort based on sector id
    source.buckets = source.buckets.sort(
      (a, b) => a.sectorId.buckets[0].key - b.sectorId.buckets[0].key
    );

    return source;
  }

  private mapKeywords(keywords) {
    const source = cloneDeep(keywords) || [];
    const output = [...source.buckets];

    // Sort based on doc_count and then alphabetically based on label
    output.sort((a, b) => {
      if (a.doc_count === b.doc_count) {
        return a.key.localeCompare(b.key);
      } else {
        return b.doc_count - a.doc_count;
      }
    });

    return output;
  }

  private mapPosition(position) {
    const source = cloneDeep(position) || [];

    /* Example bucket
    {
      "key": "Researcher",
      "doc_count": 12,
      "parent_docs": {
        "doc_count": 11,
        "distinct_people": {
          "value": 11
        }
      }
    }
    */

    const output = [...source.positions.buckets];

    // Update the doc_count to be the parent_docs.doc_count using map
    output.map((item) => {
      item.doc_count = item.parent_docs.doc_count;
    });

    output.sort((a, b) => {
      if (a.doc_count === b.doc_count) {
        return a.key.localeCompare(b.key);
      } else {
        return b.doc_count - a.doc_count;
      }
    });

    return output;
  }
}
