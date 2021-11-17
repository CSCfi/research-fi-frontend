// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { mapGroup, mapNameGroup } from './utils';

import {
  faTwitterSquare,
  faFacebookSquare,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';

import {
  faLink,
  faEnvelope,
  faPhoneSquareAlt,
} from '@fortawesome/free-solid-svg-icons';

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
  mapGroup = mapGroup;
  mapNameGroup = mapNameGroup;

  // faTwitterSquare = faTwitterSquare;
  // faFacebookSquare = faFacebookSquare;
  // faLinkedin = faLinkedin;
  // faLink = faLink;
  // faEnvelope = faEnvelope;
  // faPhoneSquareAlt = faPhoneSquareAlt;

  constructor() {}

  adapt(item: any): PersonalFields {
    const handleLinkIcon = (url: string | string[]) => {
      if (url.includes('linkedin')) {
        return faLinkedin;
      } else if (url.includes('twitter')) {
        return faTwitterSquare;
      } else if (url.includes('facebook')) {
        return faFacebookSquare;
      } else return faLink;
    };

    const email = this.mapGroup(
      item.emailGroups,
      'email',
      $localize`:@@email:Sähköposti`
    );
    const webLinks = this.mapGroup(
      item.webLinkGroups,
      'webLinks',
      $localize`:@@links:Linkit`
    );

    const mapIcons = (group, iconMethod: Function, field?: string) => {
      group['groupItems'].forEach(
        (groupItem) =>
          (groupItem.items = groupItem.items.map((item) => ({
            ...item,
            icon: iconMethod(item[field]),
          })))
      );
    };

    mapIcons(email, () => faEnvelope);
    mapIcons(webLinks, handleLinkIcon, 'url');

    return new PersonalFields(
      // TODO: Localize
      this.mapNameGroup(item.nameGroups, 'name', $localize`:@@name:Nimi`, {
        disabled: true,
        expanded: true,
        setDefault: true,
        single: true,
      }),
      this.mapNameGroup(
        item.otherNameGroups,
        'otherNames',
        $localize`:@@otherNames:Muut nimet`
      ),
      this.mapGroup(item.emailGroups, 'email', $localize`:@@email:Sähköposti`),
      webLinks
    );
  }
}
