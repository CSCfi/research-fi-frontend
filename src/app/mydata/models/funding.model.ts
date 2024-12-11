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
    item.fundingDecisions = item.fundingDecisions.map((funding) => ({
      ...this.fundingAdapter.adapt(funding),
      itemMeta: funding.itemMeta,
      dataSources: funding.dataSources,
    }));

    return new FundingFields(
      this.mydataUtils.mapGroupGeneral(
        item,
        'funding',
        'fundingDecisions',
        $localize`:@@funding:Myönnetty rahoitus`
      )
    );
  }
}
