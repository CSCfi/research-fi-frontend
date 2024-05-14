// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class PersonActivitiesAndRewards {
  constructor(
    public name: string,
    public role: string,
    public type: string,
    public description: string,
    public internationalCollaboration: string,
    public year: string,
    public organizationName: string,
    public departmentName: string,
    public url: string,
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonActivitiesAndRewardsAdapter
  implements Adapter<PersonActivitiesAndRewards>
{
  constructor(private utils: ModelUtilsService) {}

  adapt(activity: any): PersonActivitiesAndRewards {
    const getYearRange = () => {
      return [activity.startDate.year, activity.endDate.year]
        .filter((item) => item > 0)
        .join(' - ');
    };

    const translateBoolean = (value: boolean) =>
      value ? $localize`:@@yes:Kyllä` : $localize`:@@no:Ei`;

    return new PersonActivitiesAndRewards(
      this.utils.checkTranslation('name', activity),
      this.utils.checkTranslation('roleName', activity),
      this.utils.checkTranslation('activityTypeName', activity),
      this.utils.checkTranslation('description', activity),
      translateBoolean(activity.internationalCollaboration),
      getYearRange(),
      this.utils.checkTranslation('organizationName', activity),
      this.utils.checkTranslation('departmentName', activity),
      activity.url
    );
  }
}
