//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { sortItemsByNew } from '@mydata/utils';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { GetItemsByPipe } from '../../../../pipes/get-items-by.pipe';
import { SummaryDividerComponent } from '../summary-divider/summary-divider.component';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
    selector: 'app-summary-affiliations',
    templateUrl: './summary-affiliation.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        SummaryDividerComponent,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        GetItemsByPipe,
    ],
})
export class SummaryAffiliationsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldTypes: any;

  sortItemsByNew = sortItemsByNew;
  sortedItems: any[];

  locale = 'Fi';

  columns = [
    {
      label: $localize`:@@organizationUnit:Organisaation yksikkö`,
      field: 'departmentName',
    },
    { label: $localize`:@@title:Nimike`, field: 'positionName' },
    {
      label: $localize`:@@researchCommunity:Tutkimusyhteisö`,
      field: 'researchCommunity',
    },
    {
      label: $localize`:@@roleInResearchCommunity:Rooli tutkimusyhteisössä`,
      field: 'roleInResearchCommunity',
    },
  ];

  constructor(private appSettingsService: AppSettingsService) {}

  ngOnInit(): void {
    this.locale = this.appSettingsService.capitalizedLocale;
    this.sortedItems = this.sortItemsByNew(
      this.data.items,
      'itemMeta.primaryValue'
    );
  }
}
