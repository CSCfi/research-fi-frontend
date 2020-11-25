//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { Organization, OrganizationAdapter } from './organization.model';

export class Sector {

  constructor(
    public placement: number,
    public nameFi: string,
    public nameSv: string,
    public nameEn: string,
    public descriptionFi: string,
    public descriptionSv: string,
    public descriptionEn: string,
    public subtitleFi: string,
    public subtitleSv: string,
    public subtitleEn: string,
    public iframeFi: string,
    public iframeSv: string,
    public iframeEn: string,
    public icon: string,
    public organizations: Organization[],
  ) {}
}

@Injectable({
    providedIn: 'root'
})

export class SectorAdapter implements Adapter<Sector> {
  constructor( private sf: OrganizationAdapter) {}
  adapt(item: any): Sector {
    let organizations: Organization[] = [];
    item.organizations ? item.organizations.forEach(el => organizations
      .push(this.sf.adapt({...el, parent: item.placement_id}))) : organizations = [];

    return new Sector(
      item.placement_id,
      item.name_fi,
      item.name_sv,
      item.name_e,
      item.description_fi,
      item.description_sv,
      item.description_en,
      item.subtitle_fi,
      item.subtitle_sv,
      item.subtitle_en,
      item.iframe_fi,
      item.iframe_sv,
      item.iframe_en,
      item.icon,
      organizations,
    );
  }

  adaptMany(item: any): Sector[] {
    const sectors: Sector[] = [];
    const source = item;
    source.forEach(el => sectors.push(this.adapt(el)));
    return sectors;
  }
}
