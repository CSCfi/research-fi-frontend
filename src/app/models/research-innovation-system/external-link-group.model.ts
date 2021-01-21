//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ExternalLink, ExternalLinkAdapter } from './external-link.model';

export class ExternalLinkGroup {
  constructor(
    public placement: number,
    public titleFi: string,
    public titleSv: string,
    public titleEn: string,
    public links: ExternalLink[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class ExternalLinkGroupAdapter implements Adapter<ExternalLinkGroup> {
  constructor(private sf: ExternalLinkAdapter) {}
  adapt(item: any): ExternalLinkGroup {
    let links: ExternalLink[] = [];
    item.items
      ? item.items.forEach((el) =>
          links.push(this.sf.adapt({ ...el, parent: item.placement_id }))
        )
      : (links = []);

    return new ExternalLinkGroup(
      item.placement_id,
      item.title_fi,
      item.title_sv,
      item.title_en,
      links
    );
  }

  adaptMany(item: any): ExternalLinkGroup[] {
    const links: ExternalLinkGroup[] = [];
    const source = item;
    source.forEach((el) => links.push(this.adapt(el)));
    return links;
  }
}
