// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

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
    const handleLinkIcon = (url: string | string[]) => {
      if (url.includes('linkedin')) {
        return faLinkedin;
      } else if (url.includes('twitter')) {
        return faTwitterSquare;
      } else if (url.includes('facebook')) {
        return faFacebookSquare;
      } else return faLink;
    };

    const email = this.mydataUtils.mapGroup(
      item.emailGroups,
      'email',
      $localize`:@@email:Sähköposti`
    );
    const webLinks = this.mydataUtils.mapGroup(
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

    let pf: PersonalFields =  new PersonalFields(
      this.mydataUtils.mapNameGroup(
        item.nameGroups,
        'name',
        $localize`:@@name:Nimi`,
        {
          disabled: true,
          expanded: true,
          setDefault: true,
          single: true,
        }
      ),
      this.mydataUtils.mapNameGroup(
        item.otherNameGroups,
        'otherNames',
        $localize`:@@otherNames:Muut nimet`
      ),
      this.mydataUtils.mapGroup(
        item.emailGroups,
        'email',
        $localize`:@@email:Sähköposti`
      ),
      webLinks
    );
    return pf;
  }

  adaptNew(item: any): PersonalFields {
    const handleLinkIcon = (url: string | string[]) => {
      if (url.includes('linkedin')) {
        return faLinkedin;
      } else if (url.includes('twitter')) {
        return faTwitterSquare;
      } else if (url.includes('facebook')) {
        return faFacebookSquare;
      } else return faLink;
    };

    const email = this.mydataUtils.mapGroupNew(
      item.emails,
      'email',
      $localize`:@@email:Sähköposti`
    );
    const webLinks = this.mydataUtils.mapGroupNew(
      item.webLinks,
      'webLinks',
      $localize`:@@links:Linkit`
    );

    const mapIcons = (group, iconMethod: Function, field?: string) => {
      group.groupItems.map(groupItem =>
        groupItem.icon = iconMethod(groupItem.item[field]),
      );
    };

    //mapIcons(email, () => faEnvelope);
    //mapIcons(webLinks, handleLinkIcon, 'url');

    let pf: PersonalFields = new PersonalFields(
      this.mydataUtils.mapNameGroupNew(
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
      this.mydataUtils.mapNameGroupNew(
        item.otherNames,
        'otherNames',
        $localize`:@@otherNames:Muut nimet`
      ),
      this.mydataUtils.mapGroupNew(
        item.emails,
        'email',
        $localize`:@@email:Sähköposti`
      ),
      webLinks
    );
    return pf;
  }
}
