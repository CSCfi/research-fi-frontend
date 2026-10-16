//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FilterConfigType } from 'src/types';

@Injectable({
  providedIn: 'root',
})
export class InfrastructureFilterService {
  filterData: FilterConfigType[] = [
    {
      field: 'year',
      label: $localize`:@@inra-activity-heading:Infrastruktuurin toiminta`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: true,
    },
    {
      field: 'organization',
      label: $localize`:@@responsibleOrganizations:Vastuuorganisaatiot`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
    },
/*    {
      field: 'participatingOrganizations',
      label: $localize`:@@participatingOrganizations:Osallistuvat organisaatiot`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
    },*/
    {
      field: 'field',
      label: $localize`:@@fieldOfScience:Tieteenala`,
      hasSubFields: false,
      open: false,
      limitHeight: true,
    },
    {
      field: 'ESFRICodes',
      label: $localize`ESFRI-luokitus`,
      hasSubFields: false,
      open: false,
      limitHeight: true,
    },
    {
      field: 'serviceTargetSegment',
      label: $localize`:@@serviceTargetSegment:Palvelun kohderyhmä`,
      hasSubFields: false,
      open: false,
      limitHeight: true,
    },
    {
      field: 'serviceUserRole',
      label: $localize`:@@serviceUserRole:Palvelun käyttäjät`,
      hasSubFields: false,
      open: false,
      limitHeight: true,
    },
  ];

  singleFilterData = [
     {field: 'finlandRoadmap', label: $localize`Suomen Akatemian tiekartalla`, tooltip: $localize`:@@finlandRoadmapTooltip:Tutkimusinfrastruktuuri on voimassaolevalla Suomen Akatemian tiekartalla.`},
     /*{field: 'hasRelationToInternationalInfra', label: $localize`:@@hasRelationToInternationalInfra:Kuuluu kansainväliseen infrastruktuuriverkostoon.`, tooltip: ''}*/
  ];

  constructor() {}

  shapeData(data) {
    const source = data.aggregations;
    // Year
    source.year.buckets = this.mapYear(source.year.years.buckets);
    // Organization & sector
    source.organization.buckets = this.mapOrganizations(source.organization);
    // Participating organization & sector
    source.participatingOrganizations.buckets = this.mapOrganizations(source.participatingOrganizations);
    // Type
    source.type.buckets = this.typeLabel(source.type.types.buckets);
    // Field of science
    source.field = this.field(source.infraField.infraFields);
    source.ESFRICodes = this.field(source.esfri.esfriFields);
    source.serviceTargetSegment = this.field(source.serviceTargetSegment.infraSegments);
    source.serviceUserRole = this.field(source.serviceUserRole.serviceUserRoles);
    source.shaped = true;
    //this.isInfraActive(undefined);
    return source;
  }

  isInfraActive(data) {
    // Preserve original values to help on doc count calculation when switching
    // between mobile and desktop resolutions
    if (data && !data?.originalData) {
      data.originalData = data.buckets;
    }

    const now = new Date().toLocaleDateString('sv');

    // Open
    console.log('!!! now', now);

    const dates = [...data.originalData];
    let openDocs = 0;
    let closedDocs = 0;



    dates
      .filter((date) => date.key.dueDate >= now)
      .forEach((date) => (openDocs += date.filtered.doc_count));
    // Closed
    dates
      .filter((date) => date.key.dueDate < now)
      .forEach((date) => (closedDocs += date.filtered.doc_count));

    const buckets = [
      {
        label: $localize`:@@infra-filter-active:Toiminnassa`,
        key: 'active',
        doc_count: openDocs,
      },
      {
        label: $localize`:@@infra-filter-discontinued:Päättynyt`,
        key: 'discontinued',
        doc_count: closedDocs,
      },
    ];
    return buckets;
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

    return data.buckets;
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
