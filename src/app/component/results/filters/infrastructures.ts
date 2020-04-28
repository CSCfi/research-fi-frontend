//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { FilterMethodService } from '../../../services/filter-method.service';
import { StaticDataService } from '../../../services/static-data.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

export class InfrastructureFilters {
  filterData = [
      {field: 'year', labelFi: 'Aloitusvuosi', hasSubFields: false, open: true, limitHeight: true, hideSearch: true,
      tooltipFi: 'Tutkimusinfrastruktuurin toiminnan aloitusvuosi. Jos aloitusvuosi ei ole tiedossa, käytetään vuotta jolloin tiedot on toimitettu tiedejatutkimus.fi-palveluun.'},
      {field: 'type', labelFi: 'Palvelun tyyppi', hasSubFields: false, open: true, limitHeight: true}
    ];

    singleFilterData = [
      // {field: 'internationalCollaboration', labelFi: 'Kansainvälinen yhteisjulkaisu'}
    ];

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
    const source = data[0].aggregations;
    source.type.buckets = this.typeLabel(source.type.buckets);
    source.shaped = true;
    return source;
  }

  typeLabel(data) {
    const result = data.map(item => item = {
      key: item.key,
      label: item.key.charAt(0).toUpperCase() + item.key.slice(1),
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
