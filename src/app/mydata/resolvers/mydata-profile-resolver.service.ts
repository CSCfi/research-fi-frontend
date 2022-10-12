//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, OnDestroy } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { Subject, takeUntil } from 'rxjs';
import { getName } from '@mydata/utils';
import { cloneDeep, startCase } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class MyDataProfileResolverService implements Resolve<any>, OnDestroy {
  unsubscribeOnDestroy = new Subject();

  constructor(private profileService: ProfileService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    /*
     * Get MyData profile data before rendering route.
     * Data is stored in profile service.
     */
    const storedProfileData = this.profileService.currentProfileData;

    if (!storedProfileData) {
      return new Promise((resolve) => {
        this.profileService
          .getProfileData()
          .pipe(takeUntil(this.unsubscribeOnDestroy))
          .subscribe((response) => {
            // Store original data in service
            this.profileService.setCurrentProfileData(
              cloneDeep(response.profileData)
            );

            resolve({
              name: startCase(getName(response.profileData)),
              profileData: response.profileData,
            });
          });
      });
    } else {
      return {
        name: startCase(getName(storedProfileData)),
        profileData: cloneDeep(storedProfileData),
      };
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeOnDestroy.next(null);
    this.unsubscribeOnDestroy.complete();
  }
}
