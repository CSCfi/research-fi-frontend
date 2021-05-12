// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { PersonalFields, PersonalFieldsAdapter } from './personal.model';

export class Orcid {
  constructor(public personal: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class OrcidAdapter implements Adapter<Orcid> {
  constructor(private pf: PersonalFieldsAdapter) {}

  adapt(item: any): Orcid {
    const data = item.body.data;

    return new Orcid(
      Object.values(this.pf.adapt(data.personal)).filter(
        (item) => item.items.length > 0
      )
    );
  }

  adaptMany(item: any): Orcid[] {
    const entries: Orcid[] = [];
    const source = item;
    source.forEach((el) => entries.push(this.adapt(el)));
    return entries;
  }
}
