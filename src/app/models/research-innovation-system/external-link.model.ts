//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';

export class ExternalLink {
  constructor(
    public placement: number,
    public labelFi: string,
    public labelSv: string,
    public labelEn: string,
    public contentFi: string,
    public contentSv: string,
    public contentEn: string,
    public url: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class ExternalLinkAdapter implements Adapter<ExternalLink> {
  constructor() {}
  adapt(item: any): ExternalLink {
    return new ExternalLink(
      item.placement_id,
      item.label_fi,
      item.label_sv,
      item.label_en,
      item.content_fi,
      item.content_sv,
      item.content_en,
      item.url
    );
  }
}
