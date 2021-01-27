//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';

export class Organization {

  constructor(
    public placement: number,
    public nameFi: string,
    public nameSv: string,
    public nameEn: string,
    public link: string,
  ) {}
}

@Injectable({
    providedIn: 'root'
})

export class OrganizationAdapter implements Adapter<Organization> {
  constructor() {}
  adapt(item: any): Organization {
    return new Organization(
      item.placement_id,
      item.name_fi,
      item.name_sv,
      item.name_en,
      item.link,
    );
  }

}
