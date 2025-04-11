// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

import { MydataUtilityService } from '@mydata/services/mydata-utility.service';

export class PersonalFields {
  constructor(
    public name: any,
    public otherNames: any,
    public email: any,
    public webLinks: any
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonalFieldsAdapter implements Adapter<PersonalFields> {
  constructor(private mydataUtils: MydataUtilityService) {}

  adapt(item: any): PersonalFields {
    const handleLinkIcon = (url: string | string[] = '') => {
      if (url.includes('linkedin')) {
        return 'fa-linkedin';
      } else if (url.includes('twitter')) {
        return 'fa-x-twitter-square';
      } else if (url.includes('facebook')) {
        return 'fa-facebook-square';
      } else return 'link';
    };

    const email = this.mydataUtils.mapField(
      item.emails,
      'email',
      $localize`:@@email:Sähköposti`
    );

    const webLinks = this.mydataUtils.mapField(
      item.webLinks,
      'webLinks',
      $localize`:@@links:Linkit`
    );

    webLinks.items = webLinks.items.map((link) => ({
      ...link,
      value: link['url'],
    }));

    const mapIcons = (group, iconMethod: Function, field?: string) => {
      group.items.map(
        (groupItem) => (groupItem.icon = iconMethod(group[field]))
      );
    };

    mapIcons(email, () => 'fa-envelope');
    mapIcons(webLinks, handleLinkIcon, 'url');

    let pf: PersonalFields = new PersonalFields(
      this.mydataUtils.mapNameField(
        item.names,
        'name',
        $localize`:@@name:Nimi`,
        {
          disabled: true,
          expanded: true,
          setDefault: true,
          single: true,
        }
      ),
      this.mydataUtils.mapNameField(
        item.otherNames,
        'otherNames',
        $localize`:@@otherNames:Muut nimet`
      ),
      this.mydataUtils.mapField(
        item.emails,
        'email',
        $localize`:@@email:Sähköposti`
      ),
      webLinks
    );
    return pf;
  }
}
