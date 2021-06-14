// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { mapGroup, mapNameGroup } from './utils';

export class PersonalFields {
  constructor(
    public name: any,
    public otherNames: any,
    public email: any,
    public webLinks: any
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonalFieldsAdapter implements Adapter<PersonalFields> {
  mapGroup = mapGroup;
  mapNameGroup = mapNameGroup;
  constructor() {}

  adapt(item: any): PersonalFields {
    return new PersonalFields(
      // TODO: Localize
      this.mapNameGroup(item.nameGroups, 'Nimi', {
        disabled: true,
        expanded: true,
        setDefault: true,
        single: true,
      }),
      this.mapNameGroup(item.otherNameGroups, 'Muut nimet'),
      this.mapGroup(item.emailGroups, 'Sähköposti'),
      this.mapGroup(item.webLinkGroups, 'Linkit')
    );
  }
}
