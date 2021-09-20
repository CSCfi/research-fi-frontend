//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Adapter } from '../adapter.model';
import { Organization, OrganizationAdapter } from './organization.model';

export class Sector {
  constructor(
    public placement: number,
    public name: string,
    public description: string,
    public subtitle: string,
    public iframe: string,
    public icon: string,
    public organizations: Organization[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class SectorAdapter implements Adapter<Sector> {
  constructor(
    private sf: OrganizationAdapter,
    private appSettingsService: AppSettingsService
  ) {}
  adapt(item: any): Sector {
    const currentLocale = this.appSettingsService.currentLocale;
    let organizations: Organization[] = [];
    item.organizations
      ? item.organizations.forEach((el) =>
          organizations.push(
            this.sf.adapt({ ...el, parent: item.placement_id })
          )
        )
      : (organizations = []);

    return new Sector(
      item.placement_id,
      item['name_' + currentLocale],
      item['description_' + currentLocale],
      item['subtitle_' + currentLocale],
      item['iframe_' + currentLocale],
      item.icon,
      organizations
    );
  }

  adaptMany(item: any): Sector[] {
    const sectors: Sector[] = [];
    const source = item;
    source.forEach((el) => sectors.push(this.adapt(el)));
    return sectors;
  }
}
