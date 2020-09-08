//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

export class OrganizationFilters {
  filterData = [
    {field: 'sector', label: $localize`:@@sector:Sektori`, hasSubFields: false, limitHeight: false, open: true},
  ];

  singleFilterData = [
    // {field: 'internationalCollaboration', labelFi: 'Kansainvälinen yhteisjulkaisu'}
  ];

  infoData = [
    {id: '1', tooltip: $localize`:@@org1Tooltip:Yliopistolaissa mainitut 13 yliopistoa sekä Maanpuolustuskorkeakoulu toimittavat tietoja tiedejatutkimus.fi &#8209;palveluun.`},
    {id: '2', tooltip: $localize`:@@org2Tooltip:OKM:n hallinnonalalle kuuluvat 22 ammattikorkeakoulua sekä Poliisiammattikorkeakoulu toimittavat tietoja tiedejatutkimus.fi &#8209;palveluun.`},
    {id: '3', tooltip: $localize`:@@org3Tooltip:Eri hallinnonalojen alaiset tutkimuslaitokset, jotka ovat toimittaneet tietoja tiedejatutkimus.fi &#8209;palveluun.`},
    {id: '4', tooltip: $localize`:@@org4Tooltip:Suomessa on viisi asetuksella säädettyä yliopistollisen sairaalan erityisvastuualuetta. Kaikki toimittavat julkaisutietojaan tiedejatutkimus.fi &#8209;palveluun.`},
    {id: '5', tooltip: $localize`:@@org5Tooltip:Tutkimusrahoittajat, jotka ovat toimittaneet rahoituspäätösten tietoja tiedejatutkimus.fi &#8209;palveluun.`},
    {id: '6', tooltip: $localize`:@@org6Tooltip:Muut tutkimuskentällä toimivat organisaatiot, jotka eivät kuulu edellisiin kategorioihin.`}
  ];

  constructor() {}

  shapeData(data) {
    const source = data.aggregations;
    source.sector.buckets = this.sector(source.sector.sectorId.buckets);
    source.shaped = true;
    return source;
  }

  sector(data) {
    const result = data.map(item => item = {
      key: item.key,
      label: item.sectorName.buckets[0].key,
      doc_count: item.doc_count,
      tooltip: this.infoData.find(el => el.id === item.key).tooltip
    });
    return result;
  }


  getSingleAmount(data) {
    if (data.length > 0) {
      return data.filter(x => x.key === 1);
    }
  }
}
