// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class PersonalFields {
  constructor(
    public firstName: any,
    public lastName: any,
    public researcherDescriptionGroups: any,
    public webLinks: any
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonalFieldsAdapter implements Adapter<PersonalFields> {
  constructor() {}

  adapt(item: any): PersonalFields {
    const mapGroup = (group, label) => {
      group[0].groupMeta.show = true;

      return group.map((obj) => ({ ...obj, label: label }))[0];
    };

    return new PersonalFields(
      // TODO: Localize
      mapGroup(item.firstNamesGroups, 'Etunimi'),
      mapGroup(item.lastNameGroups, 'Sukunimi'),
      mapGroup(item.researcherDescriptionGroups, 'Kuvaus'),
      mapGroup(item.webLinkGroups, 'Linkit')
    );
  }
}
