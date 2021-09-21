//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { FilterMethodService } from './filter-method.service';
import { StaticDataService } from '../static-data.service';
import { cloneDeep } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class FundingFilterService {
  filterData = [
    {
      field: 'year',
      label: $localize`:@@fundingYear:Aloitusvuosi`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: true,
      tooltip: $localize`:@@fYearFTooltip:Vuosi, jolle rahoitus on myönnetty. Useampivuotisissa rahoituksissa ensimmäinen vuosi.`,
    },
    {
      field: 'organization',
      label: $localize`:@@organization:Organisaatio`,
      hasSubFields: true,
      limitHeight: false,
      tooltip: $localize`:@@fOrgFTooltip:Organisaatio, jossa saaja työskentelee tai jolle rahoitus on myönnetty.`,
    },
    {
      field: 'funder',
      label: $localize`:@@fundingFunder:Rahoittaja`,
      hasSubFields: false,
      limitHeight: false,
      open: true,
      tooltip: $localize`:@@fFunderFTooltip:Rahoituksen myöntänyt tutkimusrahoittaja. Luettelossa ovat vain ne rahoittajat, jotka toimittavat tietoja palveluun.`,
    },
    {
      field: 'typeOfFunding',
      label: $localize`:@@typeOfFunding:Rahoitusmuoto`,
      hasSubFields: true,
      limitHeight: false,
      open: false,
      tooltip: $localize`:@@fTypeOfFundingTooltip:Tapa rahoittaa tutkimusta. Rahoitusmuotoja ovat esimerkiksi tutkimusapuraha, hankerahoitus ja tutkimusinfrastruktuurirahoitus. Rahoitusmuotoja on ryhmitelty rahoittajittain suodattimeen, koska ne ovat usein rahoittajakohtaisia.`,
    },
    {
      field: 'field',
      label: $localize`:@@fieldOfScience:Tieteenala`,
      hasSubFields: true,
      limitHeight: false,
      tooltip: $localize`:@@fFieldsOfScienceTooltip:Tilastokeskuksen tieteenalaluokitus. Yhteen hankkeeseen voi liittyä useita tieteenaloja. Kaikki rahoittajat eivät käytä tieteenaloja. Siksi suodatinta käyttämällä ei voi selvittää jonkin tieteenalan osuutta kokonaisrahoituksesta.`,
    },
    // {
    //   field: 'scheme',
    //   label: 'Teema-ala',
    //   hasSubFields: false,
    //   limitHeight: false,
    //   open: true,
    //   tooltip:
    //     'Teema-ala on tutkimusrahoittajan oma tapa luokitella rahoittamaansa tutkimusta.',
    // },
    {
      field: 'topic',
      label: $localize`:@@funderTopic:Aihe`,
      hasSubFields: true,
      open: true,
      searchFromParent: true,
      tooltip: $localize`:@@funderTopicTooltip:Hankkeen aihetta luokittelevia valintoja. Pääosin luokittelut eivät ole kattavia ja voivat olla rahoittajakohtaisia.`,
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
    @Inject(LOCALE_ID) protected localeId: string
  ) {
    // Capitalize first letter of locale
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  shapeData(data) {
    const source = data.aggregations;

    if (!source.shaped) {
      // Year
      source.year.buckets = this.mapYear(source.year.years.buckets);
      // Organization
      source.organization.buckets = this.organization(
        source.organization,
        source.organizationConsortium
      );
      // Funder
      source.funder.buckets = this.funder(source.funder.funders.buckets);
      // Type of funding
      source.typeOfFunding.buckets = this.typeOfFunding(
        source.typeOfFunding.types.buckets
      );
      // Field of science
      source.field.buckets = this.minorField(source.field.fields.buckets);
      // Finnish Academy field
      source.topic.buckets = this.mapTopic(source.topic.scheme.buckets);
      source.fundingStatus.buckets = this.onGoing(
        source.fundingStatus.status.buckets
      );
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

  organization(fgp, oc) {
    let fData = fgp.funded?.sectorName.buckets || [];
    const oData = oc.funded?.sectorName.buckets || [];

    if (fData.length && oData.length) {
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
      fData = fData.concat(oData);
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

  funder(data) {
    // Filter out empty keys
    const res = data.filter((item) => {
      return item.key !== ' ';
    });

    res.map((item) => {
      item.label = item.label || item.key;
      item.key = item.funderId.buckets[0]?.key || item.key;
    });
    return res;
  }

  typeOfFunding(d) {
    const locale = this.currentLocale;

    // Copy data and check that localized data exists. If not, default to english
    const data = [...d];
    data.forEach((item) => {
      if (!item['header' + locale].buckets.length) {
        item['header' + locale] = item.headerEn;
        item['header' + locale].buckets.forEach((type) => {
          if (!type['typeName' + locale].buckets.length) {
            type['typeName' + locale] = type.typeNameEn;
          }
        });
      }
    });
    // Map sub items
    data.map((item) => {
      item.id = item.key;
      item.key = item['header' + locale].buckets[0].key;
      item.subData = item['header' + locale].buckets[0]['typeName' + locale]
        .buckets.length
        ? item['header' + locale].buckets[0]['typeName' + locale].buckets
        : item['headerEn'].buckets[0]['typeNameEn'].buckets;
      item.subData.map((type) => {
        (type.label = type.label ? type.label : type.key),
          (type.key = type.typeId.buckets[0].key),
          (type.doc_count = type.doc_count);
      });
    });

    // Rearrange with custom order
    const rearranged = [];

    data.forEach((item) => {
      switch (item.id) {
        case '0004': {
          rearranged.push(item);
          break;
        }
        case '0001': {
          rearranged.push(item);
          break;
        }
        case '0002': {
          rearranged.push(item);
          break;
        }
        case '0003': {
          rearranged.push(item);
          break;
        }
        default: {
          rearranged.push(item);
        }
      }
    });

    return rearranged.reverse();
  }

  minorField(data) {
    let res = [];
    // check if major aggregation is available
    if (data.length) {
      const combinedMajorFields = data
        ? this.filterMethodService.separateMinor(data ? data : [])
        : [];

      const result = cloneDeep(this.staticDataService.majorFieldsOfScience);

      for (let i = 0; i < combinedMajorFields.length; i++) {
        if (result[i]) {
          result[i].subData = combinedMajorFields[i];
        }
      }
      res = result;
    } else {
      res = [];
    }
    return res;
  }

  mapTopic(data) {
    data.forEach((item) => {
      item.subData = item.keywords.buckets.filter(
        (x) => x.filtered.filterCount.doc_count > 0
      );

      item.subData.map(
        (x) => (
          (x.label = x.key), (x.doc_count = x.filtered.filterCount.doc_count)
        )
      );

      switch (item.key) {
        case 'Avainsana': {
          item.key = $localize`:@@keywords:Avainsanat`;
          item.tooltip = $localize`:@@fkeywordsTooltip:Haun rajaus hankkeen tiedoissa olevien avainsanojen perusteella.`;
          break;
        }
        case 'Teema-ala': {
          item.key = $localize`:@@FAField:Teemat`;
          item.tooltip = $localize`:@@fthemesTooltip:Osa rahoittajista järjestää haut teemojen mukaisesti. Teemat ovat tyypillisesti rahoittajakohtaisia, jolloin hakutuloksessa näkyy vain yhden rahoittajan hankkeita.`;
          break;
        }
        case 'topic': {
          item.key = $localize`:@@identifiedTopic:Tunnistettu aihe`;
          item.tooltip = $localize`:@@identifiedTopicsTooltip:Koneoppimisen avulla hankkeiden tiedoista tutkimustietovarannossa muodostettu aiheluokittelu. Hanke liittyy aiheeseen, jota se todennäköisimmin käsittelee.`;
          break;
        }
        case 'Tutkimusala': {
          item.key = $localize`:@@FAResearchFields:Suomen Akatemian tutkimusalat`;
          item.tooltip = $localize`:@@fresearchFieldTooltip:Suomen Akatemian luokittelee hankkeensa myös oman tutkimusalaluokittelunsa mukaisesti. Valinta kohdistuu vain Akatemian myöntämään rahoitukseen.`;
          break;
        }
      }
    });

    //Sort
    var topic_index = 0;
    var ind_themes = 0;
    data.every((item, index) => {
      if (['Teemat', 'Themes', 'Teman'].includes(item.key)) {
        ind_themes = index;
        return false;
      }
      return true;
    });
    data.every((item, index) => {
      if (
        ['Tunnistettu aihe', 'Identified topic', 'Identifierade tema'].includes(
          item.key
        )
      ) {
        topic_index = index;
        return false;
      }
      return true;
    });
    // [data[ind_themes + 1], data[topic_index]] = [
    //   data[topic_index],
    //   data[ind_themes + 1],
    // ];

    return data;
  }

  onGoing(data) {
    return data.map(
      (item) => (item.key = { key: 'onGoing', doc_count: item.doc_count })
    );
  }

  getSingleAmount(data) {
    if (data.length > 0) {
      return data.filter((x) => x.key === 1);
    }
  }
}
