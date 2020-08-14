//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { FilterMethodService } from '../../../services/filter-method.service';
import { StaticDataService } from '../../../services/static-data.service';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

export class FundingFilters {
  filterData = [
      {field: 'year', label: $localize`:@@fundingYear:Aloitusvuosi`, hasSubFields: false, open: true, limitHeight: true, hideSearch: true,
      tooltip: $localize`:@@fYearFTooltip:Vuosi, jolle rahoitus on myönnetty. Useampivuotisissa rahoituksissa ensimmäinen vuosi.`},
      {field: 'organization', label: $localize`:@@organization:Organisaatio`, hasSubFields: true, limitHeight: false,
      tooltip: $localize`:@@fOrgFTooltip:Organisaatio, jossa saaja työskentelee tai jolle rahoitus on myönnetty.`, errorTooltip: $localize`:@@fOrgErrorTooltip:Mikäli organisaatiolla on useita rahoituksen saajia samassa hankkeessa, hanke on laskettu alla olevaan lukumäärään useaan kertaan.`},
      {field: 'funder', label: $localize`:@@fundingFunder:Rahoittaja`, hasSubFields: false, limitHeight: false, open: true,
      tooltip: $localize`:@@fFunderFTooltip:Rahoituksen myöntänyt tutkimusrahoittaja. Luettelossa ovat vain ne rahoittajat, jotka toimittavat tietoja palveluun.`},
      {field: 'typeOfFunding', label: $localize`:@@typeOfFunding:Rahoitusmuoto`, hasSubFields: true, limitHeight: false, open: false,
      tooltip: $localize`:@@fTypeOfFundingTooltip:Tapa rahoittaa tutkimusta. Rahoitusmuotoja ovat esimerkiksi tutkimusapuraha, hankerahoitus ja tutkimusinfrastruktuurirahoitus. Rahoitusmuotoja on ryhmitelty rahoittajittain suodattimeen, koska ne ovat usein rahoittajakohtaisia.`},
      {field: 'field', label: $localize`:@@fieldOfScience:Tieteenala`, hasSubFields: true, limitHeight: false,
      tooltip: $localize`:@@fFieldsOfScienceTooltip:Tilastokeskuksen tieteenalaluokitus. Yhteen hankkeeseen voi liittyä useita tieteenaloja. Kaikki rahoittajat eivät käytä tieteenaloja. Siksi suodatinta käyttämällä ei voi selvittää jonkin tieteenalan osuutta kokonaisrahoituksesta.`},
      // {field: 'scheme', label: 'Teema-ala', hasSubFields: false, limitHeight: false, open: true,
      // tooltip: 'Teema-ala on tutkimusrahoittajan oma tapa luokitella rahoittamaansa tutkimusta.'}
      {field: 'faField', label: $localize`:@@FAField:Teemat`, hasSubFields: false,  open: true}
    ];

    singleFilterData = [
      // {field: 'fundingStatus', label: 'Näytä vain käynnissä olevat hankkeet',
      // tooltip: 'Suodatukseen eivät sisälly ne hankkeet, joilla ei ole päättymisvuotta.'},
      // {field: 'internationalCollaboration', label: 'Kansainvälinen yhteistyö'}
    ];
  currentLocale: string;

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService,
               @Inject( LOCALE_ID ) protected localeId: string) {
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  shapeData(data) {
    const source = data.aggregations;
    if (!source.shaped) {
      // Year
      source.year.buckets = source.year.years.buckets;
      // Organization
      source.organization.buckets = this.organization(source.organization, source.organizationConsortium);
      // Funder
      source.funder.buckets = this.funder(source.funder.funders.buckets);
      // Type of funding
      source.typeOfFunding.buckets = this.typeOfFunding(source.typeOfFunding.types.buckets);
      // Field of science
      source.field.buckets = this.minorField(source.field.fields.buckets);
      // Finnish Academy field
      source.faField = source.faField.faFields;
      source.fundingStatus.buckets = this.onGoing(source.fundingStatus.status.buckets);
    }
    source.shaped = true;
    return source;
  }

  organization(fgp, oc) {
    let fData = fgp.funded.sectorName.buckets;
    const oData = oc.funded.sectorName.buckets;

    // // Find differences in consortium and funding group data, merge difference into fData
    const parentDiff = oData.filter(item1 => !fData.some(item2 => (item2.key === item1.key)));
    if (parentDiff.length > 0) {fData = fData.concat(parentDiff); }

    // Find differences in organizations and push into parent, sum duplicate orgs doc counts
    fData.forEach((item, i) => {

      // Find differences between fundingGroupPerson and OrganizationConsortiumo
      const diff = oData[i]?.organizations.buckets.filter(item1 =>
                  !fData[i].organizations?.buckets.some(item2 => (item2.key === item1.key)));

      // Find duplicates in fundingGroupPerson and OrganizationConsortiumo
      const duplicate = oData[i]?.organizations.buckets.filter(item1 =>
                        fData[i].organizations.buckets.some(item2 => (item2.key === item1.key)));

      // Push differences into fundingGroupPerson 
      diff.forEach(x => {
        item.organizations.buckets.push(x);
      });

      // Get filtered sums as doc_count
      item.organizations.buckets.map(org => {
        org.doc_count = org.filtered.filterCount.doc_count + (duplicate.find(d => d.key === org.key)?.filtered.filterCount.doc_count || 0);
      });

    });

    // Add data into buckets field, set key and label
    const merged = fData ? fData : [];
    merged.forEach(item => {
      item.subData = item.organizations.buckets;
      item.subData.map(subItem => {
          subItem.label = subItem.key.trim();
          subItem.key = subItem.orgId.buckets[0].key;
          subItem.doc_count = subItem.doc_count;
      });
    });
    return merged;
  }

  funder(data) {
    // Filter out empty keys
    const res = data.filter(item => {
      return item.key !== ' ';
    });
    return res;
  }

  typeOfFunding(d) {
    // Copy data and check that localized data exists. If not, default to english
    const data = [...d];
    data.forEach(item => {
      if (!item['header' + this.currentLocale].buckets.length) {
        item['header' + this.currentLocale] = item.headerEn;
        item['header' + this.currentLocale].buckets.forEach(type => {
          if (!type['typeName' + this.currentLocale].buckets.length) {
            type['typeName' + this.currentLocale] = type.typeNameEn;
          }
        });
      }
    });
    // Map sub items
    data.map(item => {
      item.id = item.key;
      item.key = item['header' + this.currentLocale].buckets[0].key;
      item.subData = item['header' + this.currentLocale].buckets[0]['typeName' + this.currentLocale].buckets;
      item.subData.map(type => {
        type.label = type.key,
        type.key = type.typeId.buckets[0].key,
        type.doc_count = type.doc_count;
      });
    });

    // Rearrange with custom order
    const rearranged = [];
    data.forEach(item => {
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
      }
    });

    return rearranged.reverse();
  }

  minorField(data) {
    let res = [];
    // check if major aggregation is available
    if (data.length) {
      const combinedMajorFields =  data ?
      (this.filterMethodService.separateMinor(data ? data : []) ) : [];
      const result = this.staticDataService.majorFieldsOfScience;
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

  onGoing(data) {
    return data.map(item => item.key = {key: 'onGoing', doc_count: item.doc_count});
  }

  getSingleAmount(data) {
      if (data.length > 0) {
        return data.filter(x => x.key === 1);
      }
    }
}
