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

export class FundingFilters {
  filterData = [
      {field: 'year', labelFi: 'Aloitusvuosi', hasSubFields: false, open: true, limitHeight: true},
      {field: '', labelFi: 'Organisaatio', hasSubFields: false, limitHeight: false},
      {field: '', labelFi: 'Rahoittaja', hasSubFields: false, limitHeight: false},
      {field: '', labelFi: 'Rahoitusmuoto', hasSubFields: false, limitHeight: false},
      {field: '', labelFi: 'Tieteenala', hasSubFields: false, limitHeight: false},
      {field: '', labelFi: 'Teema-ala', hasSubFields: false, limitHeight: false},
      {field: '', labelFi: 'Myönnetty rahoitus', hasSubFields: false, limitHeight: false},
      {field: '', labelFi: 'Hankkeen tila', hasSubFields: false, limitHeight: false},
      {field: '', labelFi: 'Kansainvälinen yhteistyö', hasSubFields: false, limitHeight: false}
    ];

    singleFilterData = [
      {field: 'internationalCollaboration', labelFi: 'Kansainvälinen yhteisjulkaisu'}
    ];

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
      const source = data[0].aggregations;
      source.shaped = true;
      return source;
  }


  getSingleAmount(data) {
      if (data.length > 0) {
        return data.filter(x => x.key === 1);
      }
    }
}
