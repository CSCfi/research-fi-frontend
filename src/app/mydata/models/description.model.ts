// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { Adapter } from './adapter.model';

export class DescriptionFields {
  constructor(public researcherDescriptionGroups: any, public keywords: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class DescriptionFieldsAdapter implements Adapter<DescriptionFields> {
  constructor(private mydataUtils: MydataUtilityService) {}

  adapt(item: any): DescriptionFields {
    return new DescriptionFields(
      this.mydataUtils.mapGroup(
        item.keywordGroups,
        'keywords',
        $localize`:@@keywords:Avainsanat`,
        {
          joined: true,
        }
      ),
      this.mydataUtils.mapGroupFieldName(
        item.researcherDescriptionGroups,
        'researchDescription',
        $localize`:@@description:Kuvaus`,
        'researchDescription',
        {
          localized: true,
        }
      )
    );
  }
  adaptNew(item: any): DescriptionFields {

    return new DescriptionFields(
      this.mydataUtils.mapGroupNew(
        item.keywords,
        'keywords',
        $localize`:@@keywords:Avainsanat`,
        {
          joined: true,
        }
      ),
      this.mydataUtils.mapGroupFieldNameNew(
        item.researcherDescriptions,
        'researchDescription',
        $localize`:@@description:Kuvaus`,
        'researchDescription',
        {
          localized: true,
        }
      )
    );
  }
}
