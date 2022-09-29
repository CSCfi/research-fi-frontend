// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { Adapter } from './adapter.model';
import { FundingAdapter } from '@portal/models/funding/funding.model';

export class FundingFields {
  constructor(public dataset: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class FundingFieldsAdapter implements Adapter<FundingFields> {
  constructor(
    private fundingAdapter: FundingAdapter,
    private mydataUtils: MydataUtilityService
  ) {}

  adapt(item: any): FundingFields {
    /*
     * Leverage model from Portal.
     */
    item.fundingDecisionGroups.forEach(
      (group) =>
        (group.items = group.items.map(
          (item) =>
            (item = {
              ...this.fundingAdapter.adapt(item),
              itemMeta: item.itemMeta,
            })
        ))
    );

    return new FundingFields(
      this.mydataUtils.mapGroup(
        item.fundingDecisionGroups,
        'fundings',
        $localize`:@@fundings:Hankkeet`
      )
    );
  }

  adaptNew(item: any): FundingFields {
    return new FundingFields(
      this.mydataUtils.mapGroupGeneralNew(
        item,
        'funding',
        'fundings',
        $localize`:@@publications:Hankkeet`
      )
    );
  }
}
