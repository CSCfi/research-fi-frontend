//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

export class NewsFilters {
  filterData = [
      {field: 'organization', labelFi: 'Organisaatio', hasSubFields: false, open: true, limitHeight: true},
    ];

  constructor() {}

  shapeData(data) {
    const source = data[0].aggregations;
    source.organization.buckets = this.organization(source.organization.buckets);
    source.shaped = true;
    return source;
  }

  organization(data) {
    const result = data.map(item => item = {
      key: item.key,
      label: item.orgName ? item.orgName.buckets[0].key : item.key,
      doc_count: item.doc_count
    });
    return result;
  }


  getSingleAmount(data) {
    if (data.length > 0) {
      return data.filter(x => x.key === 1);
    }
  }
}
