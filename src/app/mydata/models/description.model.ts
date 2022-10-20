// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Adapter } from './adapter.model';

export class DescriptionFields {
  constructor(public researcherDescriptionGroups: any, public keywords: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class DescriptionFieldsAdapter implements Adapter<DescriptionFields> {
  constructor(
    private mydataUtils: MydataUtilityService,
    private appSettingsService: AppSettingsService
  ) {}

  adapt(item: any): DescriptionFields {
    const locale = this.appSettingsService.capitalizedLocale;

    const descriptions = item.researcherDescriptions.map((el) => ({
      ...el,
      value: el['researchDescription' + locale],
    }));

    return new DescriptionFields(
      this.mydataUtils.mapField(
        item.keywords,
        'keywords',
        $localize`:@@keywords:Avainsanat`,
        {
          joined: true,
        }
      ),
      this.mydataUtils.mapField(
        descriptions,
        'researchDescription',
        $localize`:@@description:Kuvaus`,
        {
          localized: true,
        }
      )
    );
  }
}
