//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Adapter } from '../adapter.model';

export class Organization {
  constructor(
    public placement: number,
    public name: string,
    public link: string,
    public iframe: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationAdapter implements Adapter<Organization> {
  constructor(private appSettingsService: AppSettingsService) {}
  adapt(item: any): Organization {
    const currentLocale = this.appSettingsService.currentLocale;

    return new Organization(
      item.placement_id,
      item['name_' + currentLocale],
      item.link,
      item['iframe_' + currentLocale]
    );
  }
}
