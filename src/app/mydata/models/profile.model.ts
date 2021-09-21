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
import { AffiliationFieldsAdapter } from './affiliation.model';
import { EducationFieldsAdapter } from './education.model';
import { PublicationFieldsAdapter } from './publication.model';

export class Profile {
  constructor(public profileData: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class ProfileAdapter implements Adapter<Profile> {
  constructor(
    private personalFieldsAdapter: PersonalFieldsAdapter,
    private descriptionFieldsAdapter: DescriptionFieldsAdapter,
    private affiliationFieldsAdapter: AffiliationFieldsAdapter,
    private educationFieldsAdapter: EducationFieldsAdapter,
    private publicationFieldsAdapter: PublicationFieldsAdapter
  ) {}

  adapt(item: any): Profile {
    const data = item.body.data;

    const mapModel = (adapter, data) => Object.values(adapter.adapt(data));

    // TODO: Localize labels
    return new Profile([
      {
        id: 'contact',
        label: 'Yhteystiedot',
        editLabel: 'yhteystietoja',
        fields: mapModel(this.personalFieldsAdapter, data.personal),
      },
      {
        id: 'description',
        label: 'Tutkimustoiminnan kuvaus',
        editLabel: 'tutkimustoiminnan kuvausta',
        fields: mapModel(this.descriptionFieldsAdapter, data.personal),
      },
      {
        id: 'affiliation',
        label: 'Affiliaatiot',
        editLabel: 'affiliaatioita',
        fields: mapModel(this.affiliationFieldsAdapter, data.activity),
      },
      {
        id: 'educations',
        label: 'Koulutus',
        editLabel: 'koulutusta',
        fields: mapModel(this.educationFieldsAdapter, data.activity),
      },
      {
        id: 'publication',
        label: 'Julkaisut',
        editLabel: 'julkaisuja',
        fields: mapModel(this.publicationFieldsAdapter, data.activity),
      },
      {
        id: 'dataset',
        label: 'Tutkimusaineistot',
        editLabel: 'tutkimusaineistoja',
        fields: [],
      },
      { id: 'project', label: 'Hankkeet', editLabel: 'hankkeita', fields: [] },
      {
        id: 'activity',
        label: 'Aktiviteetit ja palkinnot',
        editLabel: 'aktiviteetteja ja palkintoja',
        fields: [],
      },
    ]);
  }

  adaptMany(item: any): Profile[] {
    const entries: Profile[] = [];
    const source = item;
    source.forEach((el) => entries.push(this.adapt(el)));
    return entries;
  }
}
