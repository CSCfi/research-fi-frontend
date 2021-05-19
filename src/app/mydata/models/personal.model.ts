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
    public name: any,
    public otherNames: any,
    public email: any,
    public researcherDescriptionGroups: any,
    public keywords: any,
    public webLinks: any
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonalFieldsAdapter implements Adapter<PersonalFields> {
  constructor() {}

  adapt(item: any): PersonalFields {
    console.log(item);
    const mapGroup = (group, label) => {
      return group.map((obj) => ({ ...obj, label: label }))[0];
    };

    const mapNameGroup = (group, label) => {
      group[0].items.forEach(
        (el) =>
          (el.value =
            el.fullName.trim().length > 0
              ? el.fullName
              : el.firstNames + ' ' + el.lastName)
      );

      return group.map((obj) => ({ ...obj, label: label }))[0];
    };

    return new PersonalFields(
      // TODO: Localize
      mapNameGroup(item.nameGroups, 'Nimi'),
      mapNameGroup(item.otherNameGroups, 'Muut nimet'),
      mapGroup(item.emailGroups, 'Sähköposti'),
      mapGroup(item.researcherDescriptionGroups, 'Kuvaus'),
      mapGroup(item.keywordGroups, 'Avainsanat'),
      mapGroup(item.webLinkGroups, 'Linkit')
    );
  }
}
