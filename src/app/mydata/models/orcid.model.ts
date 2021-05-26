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

export class Orcid {
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
export class OrcidAdapter implements Adapter<Orcid> {
  constructor(
    private personalFieldsAdapter: PersonalFieldsAdapter,
    private descriptionFieldsAdapter: DescriptionFieldsAdapter,
    private educationFieldsAdapter: EducationFieldsAdapter,
    private publicationFieldsAdapter: PublicationFieldsAdapter
  ) {}

  adapt(item: any): Orcid {
    const data = item.body.data;
    console.log(data);

    const mapModel = (adapter, data) =>
      Object.values(adapter.adapt(data)).filter(
        (item: any) => item?.items.length > 0
      );

    return new Orcid(
      mapModel(this.personalFieldsAdapter, data.personal),
      mapModel(this.descriptionFieldsAdapter, data.personal),
      mapModel(this.educationFieldsAdapter, data.activity),
      mapModel(this.publicationFieldsAdapter, data.activity)
    );
  }

  adaptMany(item: any): Orcid[] {
    const entries: Orcid[] = [];
    const source = item;
    source.forEach((el) => entries.push(this.adapt(el)));
    return entries;
  }
}
