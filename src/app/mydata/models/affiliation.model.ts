// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { Adapter } from './adapter.model';
import { AffiliationItemAdapter } from './item/affiliation-item.model';

export class AffiliationFields {
  constructor(public affiliation: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class AffiliationFieldsAdapter implements Adapter<AffiliationFields> {
  constructor(
    private affiliationItemAdapter: AffiliationItemAdapter,
    private mydataUtils: MydataUtilityService
  ) {}

  adapt(item: any): AffiliationFields {
    item.affiliationGroups.forEach(
      (group) =>
        (group.items = group.items.map(
          (item) => (item = this.affiliationItemAdapter.adapt(item))
        ))
    );

    return new AffiliationFields(
      this.mydataUtils.mapGroup(
        item.affiliationGroups,
        'affiliation',
        $localize`:@@affiliations:Affiliaatiot`,
        {
          primaryValue: true,
        }
      )
    );
  }
}
