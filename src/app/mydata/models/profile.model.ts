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
import { EducationFieldsAdapter } from './education.model';
import { PublicationFieldsAdapter } from './publication.model';

export class Profile {
  constructor(
    public personal: any,
    public description: any,
    public education: any,
    public publication: any
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class ProfileAdapter implements Adapter<Profile> {
  constructor(
    private personalFieldsAdapter: PersonalFieldsAdapter,
    private descriptionFieldsAdapter: DescriptionFieldsAdapter,
    private educationFieldsAdapter: EducationFieldsAdapter,
    private publicationFieldsAdapter: PublicationFieldsAdapter
  ) {}

  adapt(item: any): Profile {
    const data = item.body.data;

    const mapModel = (adapter, data) =>
      // Object.values(adapter.adapt(data)).filter(
      //   (item: any) => item?.items.length > 0
      // );
      Object.values(adapter.adapt(data));

    return new Profile(
      mapModel(this.personalFieldsAdapter, data.personal),
      mapModel(this.descriptionFieldsAdapter, data.personal),
      mapModel(this.educationFieldsAdapter, data.activity),
      mapModel(this.publicationFieldsAdapter, data.activity)
    );
  }

  adaptMany(item: any): Profile[] {
    const entries: Profile[] = [];
    const source = item;
    source.forEach((el) => entries.push(this.adapt(el)));
    return entries;
  }
}
