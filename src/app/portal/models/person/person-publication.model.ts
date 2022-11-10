// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtils } from '../utils';

export class PersonPublication {
  constructor(
    public id: string,
    public name: string,
    public year: number,
    public doi: string,
    public type: string,
    public sources: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonPublicationAdapter implements Adapter<PersonPublication> {
  constructor(private utils: ModelUtils) {}

  adapt(publication: any): PersonPublication {
    return new PersonPublication(
      publication.publicationId,
      publication.publicationName,
      publication.publicationYear,
      publication.doi,
      publication.typeCode,
      this.utils.mapSources(publication.dataSources)
    );
  }
}
