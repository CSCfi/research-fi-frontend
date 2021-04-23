// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { Adapter } from './adapter.model';

export class ContactFields {
  constructor(
    public fields: any[] // public firstName: string, // public lastName: string,
  ) // public fullName: string,
  // public webLinks: any[]
  {}
}

@Injectable({
  providedIn: 'root',
})
export class ContactFieldsAdapter implements Adapter<ContactFields> {
  constructor() {}

  adapt(item: any): ContactFields {
    const getFieldById = (id) => {
      return item.find((el) => el.fieldIdentifier === id);
    };

    const fullName = cloneDeep(getFieldById(101));
    fullName.name = getFieldById(102).name + ' ' + getFieldById(101).name;

    const webLinks = item
      .filter((el) => el.fieldIdentifier === 110)
      .map((el) => el);

    return new ContactFields([
      // Object.assign(getFieldById(102), { label: 'Etunimi', show: true }),
      // Object.assign(getFieldById(101), { label: 'Sukunimi', show: true }),
      Object.assign(fullName, { label: 'Nimi', show: true }),
      Object.assign(webLinks, { label: 'Linkit', show: true }),
    ]);
  }
}
