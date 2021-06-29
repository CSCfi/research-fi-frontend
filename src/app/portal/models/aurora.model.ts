// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Adapter } from './adapter.model';
import { LanguageCheck } from './utils';

export class Aurora {
  constructor(
    public name: number,
    public description: string,
    public terms: string,
    public contactInfo: string,
    public openDate: number,
    public dueDate: number,
    public foundation: { name: string; orgId: string; url: string },
    public categories: { id: string; name: string }[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class AuroraAdapter implements Adapter<Aurora> {
  constructor(
    private lang: LanguageCheck,
    @Inject(LOCALE_ID) protected localeId: string
  ) {}
  adapt(item: any): Aurora {
      console.log(item)

    const foundation: any = {}
    foundation.name = this.lang.testLang('name', item?.foundation);
    foundation.orgId = item?.foundation.organization_id;
    foundation.url = item?.foundation.url;

    const categories = [];
    item.categories.forEach(c => categories.push({id: c.codeValue, name: this.lang.testLang('name', c)}));

    return new Aurora(
      this.lang.testLang('name', item),
      this.lang.testLang('description', item),
      this.lang.testLang('applicationTerms', item),
      this.lang.testLang('contactInformation', item),
      Date.parse(item.callProgrammeOpenDate),
      Date.parse(item.callProgrammeDueDate),
      foundation,
      categories
    );
  }

  adaptMany(item: any): Aurora[] {
    const auroras: Aurora[] = [];
    const source = item.hits.hits;
    const totalValue = item.hits.total.value;
    // Add total count
    source.forEach((el) =>
      auroras.push(this.adapt({ ...el._source, total: totalValue }))
    );
    return auroras;
  }
}
