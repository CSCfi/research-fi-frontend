// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { FundingItemAdapter } from './item/funding-item.model';
import { mapGroup } from './utils';

export class FundingFields {
  constructor(public dataset: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class FundingFieldsAdapter implements Adapter<FundingFields> {
  mapGroup = mapGroup;
  constructor(private fundingItemAdapter: FundingItemAdapter) {}

  adapt(item: any): FundingFields {
    item.fundingDecisionGroups.forEach(
      (group) =>
        (group.items = group.items.map(
          (item) => (item = this.fundingItemAdapter.adapt(item))
        ))
    );

    return new FundingFields(
      this.mapGroup(
        item.fundingDecisionGroups,
        'fundings',
        $localize`:@@fundings:Hankkeet`
      )
    );
  }
}
