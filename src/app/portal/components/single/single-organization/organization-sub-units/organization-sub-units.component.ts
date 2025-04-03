//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgFor, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-organization-sub-units',
    templateUrl: './organization-sub-units.component.html',
    styleUrls: ['./organization-sub-units.component.scss'],
    standalone: true,
  imports: [
    NgFor,
    NgIf,
    TooltipModule,
    FontAwesomeModule,
    RouterLink,
    MatIcon
  ]
})
export class OrganizationSubUnitsComponent implements OnInit {
  @Input() item: any;
  @Input() sources: {
    finto: string;
    ytkj: string;
    tk: string;
    vipunen: string;
  };

  subUnitFields = [
    {
      label: $localize`:@@orgSubUnits:Alayksiköt`,
      field: 'subUnits',
      tooltip: $localize`:@@vipunenSource:Lähde: Vipunen – opetushallinnon tilastopalvelu www.vipunen.fi`,
    },
  ];

  subUnitSlice = 10;
  latestSubUnitYear: string;

  constructor() {}

  ngOnInit(): void {
    this.getLatestSubUnitYear();
  }

  getLatestSubUnitYear() {
    let subUnits = this.item.subUnits;
    const subUnitYears = [...new Set(subUnits.map((item) => item.year))];
    const transformedYears = subUnitYears.map(Number);

    this.latestSubUnitYear = Math.max(...transformedYears).toString();

    subUnits = subUnits.filter((item) => item.year === this.latestSubUnitYear);

    // Sort sub units by name
    subUnits.sort((a, b) => {
      const x = a.subUnitName.toLowerCase();
      const y = b.subUnitName.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }
}
