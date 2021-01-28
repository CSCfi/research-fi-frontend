// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { LanguageCheck } from '../utils';

export class RelatedFunding {
  constructor(
    public typeOfFundingName: string,
    public typeOfFundingId: number,
    public shareOfFunding: number,
    public recipientName: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class RelatedFundingAdapter implements Adapter<RelatedFunding> {
  constructor(private lang: LanguageCheck) {}
  adapt(item: any): RelatedFunding {
    return new RelatedFunding(
      this.lang.testLang('typeOfFundingName', item),
      item.typeOfFundingId,
      item.shareOfFundingInEur,
      ''
    );
  }
}
