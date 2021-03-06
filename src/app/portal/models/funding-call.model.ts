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
    public name: string,
    public description: string,
    public descriptionParsed: string,
    public terms: string,
    public contactInfo: string,
    public openDate: Date,
    public dueDate: Date,
    public openDateString: string,
    public dueDateString: string,
    public foundation: { name: string; orgId: string; url: string },
    public categories: { id: string; name: string }[],
    public daysLeft: number
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

    const description = this.lang.testLang('description', item);
    // Description without HTML
    let doc = new DOMParser().parseFromString(description ,'text/html');
    const descriptionParsed = doc.body.textContent || '';


    const foundation: any = {}
    const f = item.foundation.pop();
    foundation.name = this.lang.testLang('name', f);
    foundation.orgId = f?.organization_id?.trim();
    foundation.url = f?.url?.trim();

    const categories = [];
    item.categories.forEach(c => categories.push({id: c.codeValue, name: this.lang.testLang('name', c)}));

    const openDate = new Date(item.callProgrammeOpenDate);
    const dueDate = new Date(item.callProgrammeDueDate);

    function pad(n) {return n < 10 ? '0'+n : n};

    const openDateString = pad(openDate.getDate()) + '.' + pad(openDate.getMonth() + 1) + '.' + openDate.getFullYear();
    const dueDateString = pad(dueDate.getDate()) + '.' + pad(dueDate.getMonth() + 1) + '.' + dueDate.getFullYear();

    const daysLeft = (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

    return new FundingCall(
      item.id,
      this.lang.testLang('name', item),
      description,
      descriptionParsed,
      this.lang.testLang('applicationTerms', item),
      item.contactInformation,
      openDate,
      dueDate,
      openDateString,
      dueDateString,
      foundation,
      categories.sort((a, b) => +(a.name > b.name) - 0.5),
      Math.floor(daysLeft)
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
