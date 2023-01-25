// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { ModelUtilsService } from '@shared/services/model-util.service';
import { Adapter } from './adapter.model';

type Date = { year: number; month: number; day: number };

export class ActivitiesAndRewards {
  constructor(public activitiesRewards: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class ActivitiesAndRewardsAdapter
  implements Adapter<ActivitiesAndRewards>
{
  constructor(
    private mydataUtils: MydataUtilityService,
    private utils: ModelUtilsService
  ) {}

  adapt(item: any): ActivitiesAndRewards {
    const getTiming = (activity) => {
      const startDate: Date = activity.startDate;
      const endDate: Date = activity.endDate;

      if (endDate.year > 0) {
        return `${startDate.year} - ${endDate.year}`;
      } else if (startDate.year && startDate.month > 0 && startDate.day > 0) {
        return (
          [startDate.day, startDate.month, startDate.year].join('.') + ' -'
        );
      } else {
        return startDate.year + ' -';
      }
    };

    item.activitiesAndRewards = item.activitiesAndRewards.map((activity) => {
      const name = this.utils.checkTranslation('name', activity);
      const role = this.utils.checkTranslation('roleName', activity);
      const type = this.utils.checkTranslation('activityTypeName', activity);

      return {
        ...activity,
        name: name,
        description: this.utils.checkTranslation('description', activity),
        role: role,
        type: type,
        timing: getTiming(activity),
        roleNameType: [role, name, type]
          .filter((el) => el && el.trim().length > 0)
          .join('; '),
      };
    });

    return new ActivitiesAndRewards(
      this.mydataUtils.mapGroupGeneral(
        item,
        'activitiesAndRewards',
        'activitiesAndRewards',
        $localize`:@@activitiesAndAwards:Aktiviteetit ja palkinnot`
      )
    );
  }
}
