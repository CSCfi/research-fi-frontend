// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtilsService } from '@shared/services/model-util.service';

type ContactItem = {
  value: string;
  icon?: string;
};

export class PersonContact {
  constructor(
    public emails: ContactItem[],
    public phoneNumbers: ContactItem[],
    public otherNames: ContactItem[],
    public links: ContactItem[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonContactAdapter implements Adapter<PersonContact> {
  constructor(private utils: ModelUtilsService) {}

  adapt(data: any): PersonContact {
    const mapValues = (
      items: any[],
      options?: { fieldName?: string; icon?: string }
    ) =>
      items.map((item) => ({
        value: item[options?.fieldName ? options.fieldName : 'value'],
        icon: item.icon || options.icon,
      }));

    const emails = mapValues(data.emails, { icon: 'general.email' });
    const phoneNumbers = mapValues(data.telephoneNumbers, { icon: 'general.fa.phone' });
    const otherNames = mapValues(data.otherNames, { fieldName: 'fullName' });

    // Web links can have different icons depending on link target
    const handleLinkIcon = (url: string | string[] = '') => {
      if (url.includes('linkedin')) {
        return 'general.fa.linkedin';
      } else if (url.includes('twitter')) {
        return 'general.fa.twitter';
      } else if (url.includes('facebook')) {
        return 'general.fa.facebook';
      } else return 'general.link';
    };


    const webLinks = mapValues(
      data.webLinks.map((item) => ({
        ...item,
        icon: handleLinkIcon(item.url),
      })),
      { fieldName: 'url' }
    );

    return new PersonContact(emails, phoneNumbers, otherNames, webLinks);
  }
}
