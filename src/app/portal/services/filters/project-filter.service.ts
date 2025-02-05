//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { FilterMethodService } from './filter-method.service';
import { StaticDataService } from '../static-data.service';
import { cloneDeep } from 'lodash-es';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { FilterConfigType } from 'src/types';
import { decisionMakerLabels } from '../../../utility/localization';

@Injectable({
  providedIn: 'root',
})
export class ProjectFilterService {
  filterData: FilterConfigType[] = [
    {
      field: 'year',
      label: $localize`:@@spFiltersStartYear:Aloitusvuosi`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: true,
      tooltip: $localize`:@@spFiltersStartYearTooltip:Haun rajaus hankkeen alkamisvuoden mukaan.`,
    },
    {
      field: 'organization',
      label: $localize`:@@spFiltersOrganization:Organisaatio`,
      open: true,
      hasSubFields: false,
      limitHeight: false,
      tooltip: $localize`:@@spFiltersOrganizationTooltip:Haun rajaus hankkeeseen osallistuvien organisaatioiden mukaan.`,
    },
    {
      field: 'topic',
      label: $localize`:@@spFiltersKeywords:Avainsanat`,
      hasSubFields: false,
      open: true,
      limitHeight: false,
      tooltip: $localize`:@@spFiltersKeywordsTooltip:Haun rajaus hankkeen tiedoissa olevien avainsanojen perusteella.`,
    },
  ];

  singleFilterData = [
    // {field: 'fundingStatus', label: 'Näytä vain käynnissä olevat hankkeet',
    // tooltip: 'Suodatukseen eivät sisälly ne hankkeet, joilla ei ole päättymisvuotta.'},
    // {field: 'internationalCollaboration', label: 'Kansainvälinen yhteistyö'}
  ];

  currentLocale: string;

  constructor(
    private filterMethodService: FilterMethodService,
    private staticDataService: StaticDataService,
    @Inject(LOCALE_ID) protected localeId: string,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  // Used to count category hit amounts in filters
  shapeData(data) {
    let source = data.aggregations;

    if (!source.shaped) {
      // Year
      source.year.buckets = this.mapYear(source.year.years.buckets);
      // Organization
      source.organization = cloneDeep(source.organizations.organization);
      source.organization.buckets = source.organizations.organization.buckets.map(
        (item) => {
          //console.log('item', item.organizationName.buckets[0].key);
          item.label = item.organizationName.buckets[0].key.trim();
          item.translation = item.organizationName.buckets[0].key.trim();
          return item;
        });
      source.topic.buckets = this.mapTopic(source.topic.scheme.buckets);
    }
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
    const clone = cloneDeep(data);
    clone.map((item) => {
      item.key = item.key.toString();
    });
    return clone;
  }

  organization(fgp, oc) {
    let fData = undefined;
      // fgp.funded?.sectorName.buckets || [];
    const oData = undefined;
      // oc.funded?.sectorName.buckets || [];

    if (fData?.length && oData?.length) {
      // Find differences in consortium and funding group data, merge difference into fData
      const parentDiff = oData.filter(
        (item1) => !fData.some((item2) => item2.key === item1.key)
      );
      if (parentDiff.length > 0) {
        fData = fData.concat(parentDiff);
      }

      // Find differences in organizations and push into parent, sum duplicate orgs doc counts
      fData.forEach((item, i) => {
        // Find differences between fundingGroupPerson and OrganizationConsortium.
        // Both data sources are sorted alphabetically to match sectors
        const diff = oData
          .sort((a, b) => a.sectorId.buckets[0].key - b.sectorId.buckets[0].key)
          [i]?.organizations.buckets.filter(
          (item1) =>
            !fData
              .sort(
                (a, b) =>
                  a.sectorId.buckets[0].key - b.sectorId.buckets[0].key
              )
              [i].organizations?.buckets.sort()
              .some((item2) => item2.key === item1.key)
        );

        // Find duplicates in fundingGroupPerson and OrganizationConsortium
        const duplicate = oData[i]?.organizations.buckets.filter((item1) =>
          fData[i].organizations.buckets.some(
            (item2) => item2.key === item1.key
          )
        );

        // Push differences into fundingGroupPerson
        if (diff) {
          diff.forEach((x) => {
            item.organizations.buckets.push(x);
          });
        }

        // Get filtered sums as doc_count
        item.organizations.buckets.map((org) => {
          org.doc_count =
            org.filtered.filterCount.doc_count +
            (duplicate?.find((d) => d.key === org.key)?.filtered.filterCount
              .doc_count || 0);
        });

        // Sort by doc count
        item.organizations.buckets.sort((a, b) => b.doc_count - a.doc_count);
      });
    } else {
      //fData = fData.concat(oData);
    }

    // Add data into buckets field, filter items with doc count, set key and label
    const merged = fData ? fData : [];

    merged.forEach((item) => {
      item.subData = item.organizations.buckets.filter(
        (x) => x.doc_count > 0 && x.key !== ' '
      );
      item.subData.map((subItem) => {
        subItem.label = subItem.label || subItem.key.trim();
        subItem.key = subItem.orgId.buckets[0].key;
        subItem.doc_count = subItem.doc_count;
      });
    });
    return merged;
  }

  mapTopic(data) {
    let mappedData = [];
    data.forEach((item) => {
      if (item.key !== 'YSA' && item.key !== 'YSO') {
        mappedData = item.keywords.buckets.filter(
          (x) => x.filtered.filterCount.doc_count > 0
        );
        mappedData.map(
          (x) => (
            (x.label = x.key), (x.doc_count = x.filtered.filterCount.doc_count)
          )
        );
      }
    });
    return mappedData;
  }

  onGoing(data) {
    return data.map(
      (item) => (item.key = { key: 'onGoing', doc_count: item.doc_count })
    );
  }
}
