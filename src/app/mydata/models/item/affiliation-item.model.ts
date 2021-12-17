// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Adapter } from '../adapter.model';

export class Affiliation {
  constructor(
    public itemMeta: object,
    public positionName: string,
    public organizationName: string,
    public departmentName: string,
    public year: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class AffiliationItemAdapter implements Adapter<Affiliation> {
  constructor(private appSettingsService: AppSettingsService) {}
  adapt(item: any): Affiliation {
    const locale = this.appSettingsService.capitalizedLocale;

    const yearStart = (item.startDate.year > 0 && item.startDate.year) || '';
    const yearEnd = (item.endDate.year > 0 && item.endDate.year) || '';

    const year = `${yearStart} - ${yearEnd}`.trim();

    return new Affiliation(
      item.itemMeta,
      item['positionName' + locale],
      item['organizationName' + locale],
      item['departmentName' + locale],
      year
    );
  }
}
