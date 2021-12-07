// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';

export class Publication {
  constructor(
    public itemMeta: object,
    public id: string,
    public title: string,
    public year: string,
    public doi: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PublicationItemAdapter implements Adapter<Publication> {
  constructor() {}
  adapt(item: any): Publication {
    return new Publication(
      item.itemMeta,
      item.publicationId,
      item.publicationName,
      item.publicationYear,
      item.doi
    );
  }
}
