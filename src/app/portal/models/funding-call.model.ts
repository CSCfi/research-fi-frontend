// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, LOCALE_ID, PLATFORM_ID } from '@angular/core';
import { Adapter } from './adapter.model';
import { ModelUtilsService } from '@shared/services/model-util.service';

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
    public dueTimeString: string,
    public foundation: {
      name: string;
      orgId: string;
      url: string;
      foundationUrl: string;
      applicationUrl: string;
    },
    public categories: {
      id: string;
      name: string;
      parentId;
      parentName: string;
    }[],
    public daysLeft: number,
    public typeOfFundingId: string,
    public council: any,
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class FundingCallAdapter implements Adapter<FundingCall> {
  constructor(
    private utils: ModelUtilsService,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}
  adapt(item: any): FundingCall {
    const description = this.utils.checkTranslation('description', item);
    let descriptionParsed = '';

    // Description without HTML
    if (isPlatformBrowser(this.platformId)) {
      let doc = new DOMParser().parseFromString(description, 'text/html');
      descriptionParsed = doc.body.textContent || '';
    }

    const foundation: any = {};
    if (item?.foundation) {
      const f = item?.foundation.pop();
      foundation.name = this.utils.checkTranslation('name', f);
      foundation.orgId = f?.organization_id?.trim();
      foundation.url = f?.url?.trim();
      foundation.foundationUrl = f?.foundationURL?.trim();
    }

    if (this.localeId === 'fi') {
      foundation.applicationUrl = item?.applicationURL_fi
        ? item.applicationURL_fi
        : item?.applicationURL_sv
        ? item.applicationURL_sv
        : item.applicationURL_en
        ? item.applicationURL_en
        : '';
    } else if (this.localeId === 'sv') {
      foundation.applicationUrl = item?.applicationURL_sv
        ? item.applicationURL_sv
        : item?.applicationURL_fi
        ? item.applicationURL_fi
        : item.applicationURL_en
        ? item.applicationURL_en
        : '';
    } else if (this.localeId === 'en') {
      foundation.applicationUrl = item?.applicationURL_en
        ? item.applicationURL_en
        : item?.applicationURL_fi
        ? item.applicationURL_fi
        : item.applicationURL_sv
        ? item.applicationURL_sv
        : '';
    }

    const categories = [];
    item.categories?.forEach((c) => {
      categories.push({
        id: c.codeValue,
        name: this.utils.checkTranslation('name', c),
        parentName: this.utils.checkTranslation('broaderName', c),
        parentId: c.broaderCodeValue,
      });
    });

    const openDate = new Date(item.callProgrammeOpenDate);
    const dueDate = new Date(item.callProgrammeDueDate);
    const dueTimeString = item?.callProgrammeDueTime
      ? item.callProgrammeDueTime.slice(0, item.callProgrammeDueTime.length - 3)
      : '';

    function pad(n) {
      return n < 10 ? '0' + n : n;
    }

    const daysLeft =
      (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

    const openDateStringFi = Intl.DateTimeFormat("fi-FI", {   timeZone: "GMT",
      day: "numeric",
      month: "numeric",
      year: "numeric" }).format(openDate.getTime());

    const dueDateStringFi = Intl.DateTimeFormat("fi-FI", {   timeZone: "GMT",
      day: "numeric",
      month: "numeric",
      year: "numeric" }).format(dueDate.getTime());

    // Rahoitustyyppi
    // console.log("item.typeOfFundingId", item.typeOfFundingId);

    // Päätökset? siis Rahoitushaun vaiheet (?)
    // console.log("item.council", item.council);

    // Yhteistiedot ja --> titteli? <--

    return new FundingCall(
      item.id,
      this.utils.checkTranslation('name', item),
      description,
      descriptionParsed,
      this.utils.checkTranslation('applicationTerms', item),
      item.contactInformation,
      openDate,
      dueDate,
      openDateStringFi,
      dueDateStringFi,
      dueTimeString,
      foundation,
      categories.sort((a, b) => +(a.name > b.name) - 0.5),
      Math.floor(daysLeft),
      item.typeOfFundingId,
      item.council
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
