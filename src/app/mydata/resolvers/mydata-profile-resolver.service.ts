//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { Subject, takeUntil } from 'rxjs';
import { getName } from '@mydata/utils';
import { cloneDeep } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class MyDataProfileResolverService  implements OnDestroy {
  unsubscribeOnDestroy = new Subject();

  constructor(private profileService: ProfileService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    // await this.profileService.getProfileData().then((value) => {});

    /*
     * Get MyData profile data before rendering route.
     * Data is stored in profile service.
     */
    const storedProfileData = this.profileService.currentProfileData;

    if (!storedProfileData) {
      return new Promise((resolve) => {
        this.profileService
          .fetchProfileDataFromBackend()
          .then(
            (value) => {
              if (value) {
                this.profileService.setCurrentProfileData(
                  cloneDeep(value.profileData)
                );
                resolve({
                  name: getName(value.profileData),
                  profileData: value.profileData,
                });
              }
            },
            (reason) => {
              console.error('error', reason);
            },);
      });
    } else {
      return {
        name: getName(storedProfileData),
        profileData: cloneDeep(storedProfileData),
      };
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeOnDestroy.next(null);
    this.unsubscribeOnDestroy.complete();
  }
}
