// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { PersonalFieldsAdapter } from './personal.model';
import { DescriptionFieldsAdapter } from './description.model';

export class Orcid {
  constructor(public personal: any, public description: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class OrcidAdapter implements Adapter<Orcid> {
  constructor(
    private pf: PersonalFieldsAdapter,
    private df: DescriptionFieldsAdapter
  ) {}

  adapt(item: any): Orcid {
    const data = item.body.data;

    const mapModel = (adapter, data) =>
      Object.values(adapter.adapt(data)).filter(
        (item: any) => item.items.length > 0
      );

    return new Orcid(
      mapModel(this.pf, data.personal),
      mapModel(this.df, data.personal) // Description
    );
  }

  adaptMany(item: any): Orcid[] {
    const entries: Orcid[] = [];
    const source = item;
    source.forEach((el) => entries.push(this.adapt(el)));
    return entries;
  }
}
