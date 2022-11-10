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
export class PersonFilterService {
  filterData = [
    {
      field: 'organization',
      label: $localize`:@@organization:Organisaatio`,
      // hasSubFields: true,
      open: true,
    },
  ];

  singleFilterData = [
    // {field: 'internationalCollaboration', labelFi: 'Kansainvälinen yhteisjulkaisu'}
  ];

  constructor() {}

  shapeData(data) {
    const source = data.aggregations;

    source.organization.buckets = this.mapOrganizations(
      source.organization.buckets
    );
    source.shaped = true;
    return source;
  }

  mapOrganizations(organizations) {
    return organizations?.map(
      (item) =>
        (item = {
          key: item.key,
          label: item.key,
          doc_count: item.doc_count,
        })
    );
  }
}
