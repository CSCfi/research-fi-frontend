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
      {field: 'year', label: $localize`:@@fundingYear:Aloitusvuosi`, hasSubFields: false, open: true, limitHeight: true, hideSearch: true,
      tooltip:  $localize`:@@iYearFTooltip:Tutkimusinfrastruktuurin toiminnan aloitusvuosi. Jos aloitusvuosi ei ole tiedossa, käytetään vuotta jolloin tiedot on toimitettu tiedejatutkimus.fi-palveluun.`},
      {field: 'organization', label: $localize`:@@responsibleOrganization:Vastuuorganisaatio`, hasSubFields: true, open: false, limitHeight: true},
      {field: 'type', label: $localize`:@@serviceType:Palvelun tyyppi`, hasSubFields: false, open: true, limitHeight: true},
      {field: 'field', label: $localize`:@@fieldOfScience:Tieteenala`, hasSubFields: false, open: true, limitHeight: true}
    ];

    singleFilterData = [
      // {field: 'internationalCollaboration', label: 'Kansainvälinen yhteisjulkaisu'}
    ];

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
    const source = data.aggregations;
    // Year
    source.year.buckets = source.year.years.buckets;
    // Organization & sector
    this.organization(source.organization);
    // Type
    source.type.buckets = this.typeLabel(source.type.types.buckets);
    // Field of science
    source.field = source.infraField.infraFields;
    source.shaped = true;
    return source;
  }

  organization(data) {
    data.buckets = data.sector ? data.sector.buckets : [];
    data.buckets.forEach(item => {
      item.subData = item.organizations.buckets;
      item.subData.map(subItem => {
          subItem.label = subItem.key;
          subItem.key = subItem.organizationId.buckets.pop()?.key?.toString();
          // subItem.doc_count = subItem.filtered.filterCount.doc_count;
      });
    });
  }

  typeLabel(data) {
    data.forEach(type => {
      switch (type.key) {
        case 'palvelu': {
          type.label = $localize`:@@infraServiceTypeService:Palvelu`;
          break;
        }
        case 'aineisto': {
          type.label = $localize`:@@infraServiceTypeMaterial:Aineisto`;
          break;
        }
        case 'laitteisto': {
          type.label = $localize`:@@infraServiceTypeEquipment:Laitteisto`;
          break;
        }
      }
    });
    const result = data.map(item => item = {
      key: item.key,
      label: item.label,
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
