//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Adapter } from '../adapter.model';
import { ExternalLink, ExternalLinkAdapter } from './external-link.model';

export class ExternalLinkGroup {
  constructor(
    public placement: number,
    public title: string,
    public links: ExternalLink[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class ExternalLinkGroupAdapter implements Adapter<ExternalLinkGroup> {
  constructor(
    private sf: ExternalLinkAdapter,
    private appSettingsService: AppSettingsService
  ) {}
  adapt(item: any): ExternalLinkGroup {
    let links: ExternalLink[] = [];
    item.items
      ? item.items.forEach((el) =>
          links.push(this.sf.adapt({ ...el, parent: item.placement_id }))
        )
      : (links = []);

    const currentLocale = this.appSettingsService.currentLocale;

    return new ExternalLinkGroup(
      item.placement_id,
      item['title_' + currentLocale],
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
