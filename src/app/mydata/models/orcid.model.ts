// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { ContactFields, ContactFieldsAdapter } from './contact.model';

export class Orcid {
  constructor(public contactFields: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class OrcidAdapter implements Adapter<Orcid> {
  constructor(private cf: ContactFieldsAdapter) {}

  adapt(item: any): Orcid {
    const data = item.body.data;

    const contactFieldIdentifiers = [101, 102, 110];

    const contactFields = data
      .map((item) => {
        if (contactFieldIdentifiers.includes(item.fieldIdentifier)) return item;
      })
      .filter((item) => item);

    return new Orcid(this.cf.adapt(contactFields));
  }

  adaptMany(item: any): Orcid[] {
    const entries: Orcid[] = [];
    const source = item;
    source.forEach((el) => entries.push(this.adapt(el)));
    return entries;
  }
}
