// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Adapter } from './adapter.model';
import { LanguageCheck } from './utils';

export class FundingCall {
  constructor(
    public id: number,
    public name: number,
    public description: string,
    public terms: string,
    public contactInfo: string,
    public openDate: Date,
    public dueDate: Date,
    public foundation: { name: string; orgId: string; url: string },
    public categories: { id: string; name: string }[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class FundingCallAdapter implements Adapter<FundingCall> {
  constructor(
    private lang: LanguageCheck,
    @Inject(LOCALE_ID) protected localeId: string
  ) {}
  adapt(item: any): FundingCall {
      console.log(item)

    const foundation: any = {}
    const f = item.foundation.pop();
    foundation.name = this.lang.testLang('name', f);
    foundation.orgId = f?.organization_id;
    foundation.url = f?.url;

    const categories = [];
    item.categories.forEach(c => categories.push({id: c.codeValue, name: this.lang.testLang('name', c)}));

    const openDate = new Date(item.callProgrammeOpenDate)
    const dueDate = new Date(item.callProgrammeDueDate)

    return new FundingCall(
      item.id,
      this.lang.testLang('name', item),
      this.lang.testLang('description', item),
      this.lang.testLang('applicationTerms', item),
      this.lang.testLang('contactInformation', item),
      openDate,
      dueDate,
      foundation,
      categories
    );
  }

  adaptMany(item: any): FundingCall[] {
    const fundingCalls: FundingCall[] = [];
    const source = item.hits.hits;
    const totalValue = item.hits.total.value;
    // Add total count
    source.forEach((el) =>
      fundingCalls.push(this.adapt({ ...el._source, total: totalValue }))
    );
    return fundingCalls;
  }
}
