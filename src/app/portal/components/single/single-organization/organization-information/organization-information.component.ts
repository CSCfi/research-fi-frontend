//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-organization-information',
  templateUrl: './organization-information.component.html',
  styleUrls: ['./organization-information.component.scss'],
})
export class OrganizationInformationComponent implements OnInit {
  @Input() item: any;
  @Input() sources: {
    finto: string;
    ytkj: string;
    tk: string;
    vipunen: string;
  };

  infoFields = [
    {
      label: $localize`:@@orgNameTranslation:Nimi (EN, SV)`,
      field: 'nameTranslations',
    },
    {
      label: $localize`:@@orgOtherNames:Muut nimet`,
      field: 'variantNames',
      tooltip: 'finto',
    },
    {
      label: $localize`:@@orgEstablished:Perustettu`,
      field: 'established',
      tooltip: 'finto',
    },
    {
      label: $localize`:@@orgBackground:Lisätietoa`,
      field: 'background',
      tooltip: 'finto',
    },
    {
      label: $localize`:@@orgPredecessor:Edeltävä organisaatio`,
      field: 'predecessors',
      tooltip: 'finto',
    },
    {
      label: $localize`:@@orgRelated:Liittyvä organisaatio`,
      field: 'related',
      tooltip: 'finto',
    },
    {
      label: $localize`:@@orgType:Organisaatiomuoto`,
      field: 'organizationType',
      tooltip: 'ytj',
    },
    {
      label: $localize`:@@orgSector:Organisaation tyyppi`,
      field: 'sectorNameFi',
      tooltip: 'ytj',
    },
    {
      label: $localize`:@@orgVAddress:Käyntiosoite`,
      field: 'visitingAddress',
      tooltip: 'ytj',
    },
    {
      label: $localize`:@@orgAddress:Postiosoite`,
      field: 'postalAddress',
      tooltip: 'ytj',
    },
    {
      label: $localize`:@@orgBID:Y-tunnus`,
      field: 'businessId',
      tooltip: 'ytj',
    },
    {
      label: $localize`:@@orgSTID:Tilastokeskuksen oppilaitostunnus`,
      field: 'statCenterId',
      tooltip: 'tk',
    },
    {
      label: $localize`:@@orgStaffCount:Opetus- ja tutkimushenkilöstön määrä (htv)`,
      field: 'staffCountAsFte',
      tooltip: 'vipunen',
    },
  ];

  studentCounts = [
    {
      label: $localize`:@@orgThesisCountBsc:Alempi korkeakoulututkinto`,
      field: 'thesisCountBsc',
    },
    {
      label: $localize`:@@orgThesisCountMsc:Ylempi korkeakoulututkinto`,
      field: 'thesisCountMsc',
    },
    {
      label: $localize`:@@orgThesisCountLic:Lisensiaatintutkinto`,
      field: 'thesisCountLic',
    },
    {
      label: $localize`:@@orgThesisCountPhd:Tohtorintutkinto`,
      field: 'thesisCountPhd',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.shapeData();
  }

  shapeData() {
    const source = this.item;

    // Hide statCenterId from other organizations than universities
    if (
      !(source.sectorNameFi === 'Ammattikorkeakoulu') &&
      !(source.sectorNameFi === 'Yliopisto')
    ) {
      source.statCenterId = '';
    }

    // Check for applied university to display correct field name
    if (source.sectorNameFi === 'Ammattikorkeakoulu') {
      this.studentCounts[0].label = $localize`:@@orgThesisCountBscApplied:Alempi ammattikorkeakoulutukinto`;
      this.studentCounts[1].label = $localize`:@@orgThesisCountMscApplied:Ylempi ammattikorkeakoulutukinto`;
    }
  }
}
