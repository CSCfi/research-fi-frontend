// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Adapter } from './adapter.model';

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
    private appSettingsService: AppSettingsService
  ) {}

  adapt(item: any): ActivitiesAndRewards {
    console.log('item: ', item.activitiesAndRewards);

    const locale = this.appSettingsService.capitalizedLocale;

    item.activitiesAndRewards = item.activitiesAndRewards.map((el) => ({
      name: el['name' + locale],
    }));

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
