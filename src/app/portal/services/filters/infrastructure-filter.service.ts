//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FilterConfigType } from 'src/types';
import { date } from 'zod';

@Injectable({
  providedIn: 'root',
})
export class InfrastructureFilterService {
  filterData: FilterConfigType[] = [
    {
      field: 'infraIsActive',
      label: $localize`:@@inra-activity-heading:Infrastruktuurin toiminta`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
    },
    {
      field: 'startAndEndYearly',
      label: $localize`:@@infraFiltersStartAndEndYearlyHeading:Toiminnan aloitus ja päättyminen vuosittain`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
    },
    {
      field: 'organization',
      label: $localize`:@@responsibleOrganizations:Vastuuorganisaatiot`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
    },
    {
      field: 'participatingOrganizations',
      label: $localize`:@@participatingOrganizations:Osallistuvat organisaatiot`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
    },
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
    {
      field: 'hasRelationToInternationalInfra',
      label: $localize`:@@hasRelationToInternationalInfra:Kuuluu kansainväliseen infrastruktuuriverkostoon`,
      hasSubFields: false,
      open: true,
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
    source.hasRelationToInternationalInfra = {
      buckets: this.formatIsPartOfInternationalInfra(source.hasRelationToInternationalInfra.hasRelationToInternationalInfraCodes)
    };
    source.infraIsActive = {
      buckets: this.formatInfraIsActive(source.infraIsActive.infraIsActiveCodes)
    };
    source.startAndEndYearly = {
      buckets: this.formatStartAndEndYearly(source.activityYears)
    };
    source.shaped = true;
    return source;
  }

  formatInfraIsActive(data) {
    let ret = [];
    data.buckets.forEach(item => {
      if (item) {
        ret.push({ label:(item.key === 'false' ? $localize`:@@infra-filter-discontinued:Päättynyt` : $localize`:@@infra-filter-active:Toiminnassa`), doc_count: item.doc_count})
      }
    });
    return ret
  }

  formatIsPartOfInternationalInfra(data) {
    let ret = [];
    data.buckets.forEach(item => {
      if (item) {
        ret.push({ label:(item.key_as_string === 'false' ? $localize`:@@no:Ei` : $localize`:@@yes:Kyllä`), key: item.key, doc_count: item.doc_count})
      }
    });
    return ret
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
      // Name variants of the same organization share an id, merge them into one entry
      const merged = new Map();
      item.subData.forEach((subItem) => {
        const existing = merged.get(subItem.key);
        if (existing) {
          existing.doc_count += subItem.doc_count;
        } else {
          merged.set(subItem.key, subItem);
        }
      });
      item.subData = [...merged.values()];
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

  processZeroDays(dateArray: any[]) {
    dateArray.map((item) => {
      if (dateArray[0] === 0 ) {
        dateArray[0] = '00';
      }
      if (dateArray[1] === 0 ) {
        dateArray[1] = '00';
      }
      if (dateArray[2] === 0 ) {
        dateArray[2] = '00';
      }
    });
    return parseInt(dateArray[0] + '' + dateArray[1] + '' + dateArray[2], 10);
  }

  formatActivityStatus(data) {
    // Preserve original values to help on doc count calculation when switching
    // between mobile and desktop resolutions
    if (data && !data?.originalData) {
      data.originalData = data.buckets;
    }

    const now = new Date().toLocaleDateString('sv');

    // 'sv' locale format is yyyy-mm-dd
    const [year, month, day] = now.split('-');
    const dmyNow = parseInt(year + month + day, 10);

    const dates: any[] = [...data.originalData];
    dates.map(date => {
      date.processedDate = this.processZeroDays(date.key);
    });

    let openDocs = 0;
    let closedDocs = 0;

    dates
      .filter((date) => date.processedDate >= dmyNow)
      .forEach((date) => (openDocs += date.doc_count));
    // Closed
    dates
      .filter((date) => date.processedDate < dmyNow)
      .forEach((date) => (closedDocs += date.doc_count));

    const buckets = [
      {
        label: $localize`:@@infra-filter-active:Toiminnassa`,
        key: 'true',
        doc_count: openDocs,
      },
      {
        label: $localize`:@@infra-filter-discontinued:Päättynyt`,
        key: 'false',
        doc_count: closedDocs,
      },
    ];
    return buckets;
  }

  formatStartAndEndYearly(data) {
    const selectedYear = 2020;

    /*    dates
          .filter((date) => date.processedDate >= dmyNow)
          .forEach((date) => (openDocs += date.doc_count));
        // Closed
        dates
          .filter((date) => date.processedDate < dmyNow)
          .forEach((date) => (closedDocs += date.doc_count));*/

    const buckets = [
      {
        label: $localize`:@@infraFiltersHasStarted:Toiminta aloitettu`,
        key: 'start',
        doc_count: 0,
      },
      {
        label: $localize`:@@infraFiltersHasEnded:Toiminta päättynyt`,
        key: 'end',
        doc_count: 0,
      },
    ];
    return buckets;
  }
}
