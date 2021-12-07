// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Adapter } from '../adapter.model';

export class Dataset {
  constructor(
    public itemMeta: object,
    public id: string,
    public title: string,
    public description: string,
    public preferredIdentifiers: object
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class DatasetItemAdapter implements Adapter<Dataset> {
  constructor(private appSettingsService: AppSettingsService) {}
  adapt(item: any): Dataset {
    const locale = this.appSettingsService.capitalizedLocale;

    return new Dataset(
      item.itemMeta,
      item.identifier,
      item['name' + locale],
      item['description' + locale],
      item.preferredIdentifiers
    );
  }
}
