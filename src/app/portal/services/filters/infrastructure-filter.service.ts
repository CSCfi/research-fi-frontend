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
export class InfrastructureFilterService {
  filterData = [
    {
      field: 'year',
      label: $localize`:@@fundingYear:Aloitusvuosi`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: true,
      tooltip: $localize`:@@iYearFTooltip:Tutkimusinfrastruktuurin toiminnan aloitusvuosi. Jos aloitusvuosi ei ole tiedossa, käytetään vuotta jolloin tiedot on toimitettu tiedejatutkimus.fi-palveluun.`,
    },
    {
      field: 'organization',
      label: $localize`:@@responsibleOrganization:Vastuuorganisaatio`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
    },
    {
      field: 'type',
      label: $localize`:@@serviceType:Palvelun tyyppi`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
    },
    {
      field: 'field',
      label: $localize`:@@fieldOfScience:Tieteenala`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
    },
  ];

  singleFilterData = [
    // {field: 'internationalCollaboration', label: 'Kansainvälinen yhteisjulkaisu'}
  ];

  constructor() {}

  shapeData(data) {
    const source = data.aggregations;
    // Year
    source.year.buckets = this.mapYear(source.year.years.buckets);
    // Organization & sector
    source.organization.buckets = this.mapOrganizations(source.organization);
    // Type
    source.type.buckets = this.typeLabel(source.type.types.buckets);
    // Field of science
    source.field = this.field(source.infraField.infraFields);
    source.shaped = true;
    return source;
  }

  mapYear(data) {
    const clone = cloneDeep(data);
    clone.map((item) => {
      item.key = item.key.toString();
    });
    return clone;
  }

  mapOrganizations(data) {
    data.buckets = data.sector ? data.sector.buckets : [];
    data.buckets.forEach((item) => {
      item.id = item.sectorId.buckets[0].key;
      item.subData = item.organizations.buckets;
      item.subData.map((subItem) => {
        subItem.label = subItem.key;
        subItem.key = subItem.organizationId.buckets.pop()?.key?.toString();
        // subItem.doc_count = subItem.filtered.filterCount.doc_count;
      });
    });
    // Sort by sector id
    data.buckets.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

    return data.buckets
  }

  typeLabel(data) {
    data.forEach((type) => {
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
    const result = data.map(
      (item) =>
        (item = {
          key: item.key,
          label: item.label,
          doc_count: item.doc_count,
        })
    );
    return result;
  }

  field(data) {
    data.buckets.map((item) => {
      item.label = item.label ? item.label : item.key;
      item.key = item.majorId.buckets[0].key;
      item.doc_count = item.filtered.filterCount.doc_count;
    });
    return data;
  }
}
