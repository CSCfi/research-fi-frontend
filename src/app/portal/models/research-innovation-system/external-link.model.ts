//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Adapter } from '../adapter.model';

export class ExternalLink {
  constructor(
    public placement: number,
    public label: string,
    public content: string,
    public url: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class ExternalLinkAdapter implements Adapter<ExternalLink> {
  constructor(private appSettingsService: AppSettingsService) {}
  adapt(item: any): ExternalLink {
    const currentLocale = this.appSettingsService.currentLocale;
    return new ExternalLink(
      item.placement_id,
      item['label_' + currentLocale],
      item['content_' + currentLocale],
      item['url_' + currentLocale]
    );
  }
}
