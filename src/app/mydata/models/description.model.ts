// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { CapitalizedLocales } from '@shared/constants';
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

    const locales = CapitalizedLocales;

    // Map value key for use of data sources table.
    // Filter out descriptions with no contents.
    const descriptions = item.researcherDescriptions
      .map((el) => ({
        ...el,
        value: el['researchDescription' + locale],
      }))
      .filter((el) =>
        locales.some(
          (localeId) => el['researchDescription' + localeId].trim().length > 1
        )
      );

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
