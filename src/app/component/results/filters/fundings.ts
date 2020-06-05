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
      {field: 'year', label: $localize`:@@fundingYear:Aloitusvuosi`, hasSubFields: false, open: true, limitHeight: true, hideSearch: true,
      tooltip: $localize`:@@fYearFTooltip:Vuosi, jolle rahoitus on myönnetty. Useampivuotisissa rahoituksissa ensimmäinen vuosi.`},
      {field: 'organization', label: $localize`:@@organization:Organisaatio`, hasSubFields: true, limitHeight: false,
      tooltip: $localize`:@@fOrgFTooltip:Organisaatio, jossa saaja työskentelee tai jolle rahoitus on myönnetty.`},
      {field: 'funder', label: $localize`:@@fundingFunder:Rahoittaja`, hasSubFields: false, limitHeight: false, open: true,
      tooltip: $localize`:@@fFunderFTooltip:Rahoituksen myöntänyt tutkimusrahoittaja. Luettelossa ovat vain ne rahoittajat, jotka toimittavat tietoja palveluun.`},
      {field: 'typeOfFunding', label: $localize`:@@typeOfFunding:Rahoitusmuoto`, hasSubFields: false, limitHeight: false, open: true,
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

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
    const source = data.aggregations;
    // Year
    source.year.buckets = source.year.years.buckets;
    // Organization
    source.organization.buckets = this.organization(source.organization, source.organizationConsortium);
    // Funder
    source.funder.buckets = this.funder(source.funder.funders.buckets);
    // Type of funding
    source.typeOfFunding.buckets = this.typeOfFunding(source.typeOfFunding.types.buckets);
    // Major field
    source.field.buckets = this.minorField(source.field.fields.buckets);
    // Finnish Academy field
    source.faField = source.faField.faFields;
    source.shaped = true;
    source.fundingStatus.buckets = this.onGoing(source.fundingStatus.status.buckets);
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
      const diff = oData[i]?.organizations.buckets.filter(item1 =>
                   !fData[i].organizations?.buckets.some(item2 => (item2.key === item1.key)));

      const duplicate = oData[i]?.organizations.buckets.filter(item1 =>
        fData[i].organizations.buckets.some(item2 => (item2.key === item1.key)));

      if (duplicate?.length > 0) {
        item.organizations.buckets.map(org => {
          org.doc_count = org.filtered.filterCount.doc_count + duplicate.find(x => x.key === org.key).filtered.filterCount.doc_count;
        });
      }

      if (diff?.length > 0) {
        diff.forEach(x => {
          item.organizations.buckets.push(x);
        });
      }
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

  typeOfFunding(data) {
    // Map data to match template
    const res = data.map(item =>
      item = {
        key: item.key,
        doc_count: item.doc_count,
        label: item.typeName.buckets[0]?.key
    })
    return res;
  }

  minorField(data) {
    // check if major aggregation is available
    const combinedMajorFields =  data ?
    (this.filterMethodService.separateMinor(data ? data : []) ) : [];

    const result = this.staticDataService.majorFieldsOfScience;
    for (let i = 0; i < combinedMajorFields.length; i++) {
      if (result[i]) {
          result[i].subData = combinedMajorFields[i];
      }
    }
    return result;
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
