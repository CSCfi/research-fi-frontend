// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { UtilityService } from '@shared/services/utility.service';
import { Adapter } from '../adapter.model';

export class Funding {
  constructor(
    public itemMeta: object,
    public id: string,
    public title: string,
    public description: string,
    public funderName: string,
    public callProgrammeName: string,
    public typeOfFundingName: string,
    public acronym: string,
    public amount: string,
    public year: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class FundingItemAdapter implements Adapter<Funding> {
  constructor(private appSettingsService: AppSettingsService) {}
  adapt(item: any): Funding {
    const locale = this.appSettingsService.capitalizedLocale;

    const year = `${item.startDate.year} - ${
      item.endDate.year > 0 ? item.endDate.year : ''
    }`;

    return new Funding(
      item.itemMeta,
      item.projectId,
      item['projectName' + locale],
      item['projectDescription' + locale],
      item['funderName' + locale],
      item['callProgrammeName' + locale],
      item['typeOfFundingName' + locale],
      item.projectAcronym,
      UtilityService.thousandSeparator(item.amountInEur) + '€',
      year
    );
  }
}
