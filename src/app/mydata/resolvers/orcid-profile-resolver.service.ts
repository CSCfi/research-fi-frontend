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
import { AppSettingsService } from '@shared/services/app-settings.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrcidProfileResolverService implements Resolve<any>, OnDestroy {
  unsubscribeOnDestroy = new Subject();

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private profileService: ProfileService,
    private appSettingsService: AppSettingsService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    /*
     * Get orcid profile data before rendering route.
     * Data is stored in profile service
     *
     * Orcid ID is stored in ID token payload
     */
    const orcidUserProfile = this.profileService.orcidUserProfile;

    if (!orcidUserProfile) {
      return new Promise((resolve) => {
        this.oidcSecurityService.userData$
          .pipe(takeUntil(this.unsubscribeOnDestroy))
          .subscribe((data) => {
            if (data.userData) {
              const idTokenPayload =
                this.oidcSecurityService.getPayloadFromIdToken();

              // Create object that holds necessary ORCID profile items
              const userData = {
                ...data.userData,
                orcid: idTokenPayload.orcid,
              };

              this.profileService.setOrcidUserProfile(userData);
              this.appSettingsService.setOrcid(userData.orcid);

              resolve(userData);
            } else {
              return false;
            }
          });
      });
    } else {
      return orcidUserProfile;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeOnDestroy.next(null);
    this.unsubscribeOnDestroy.complete();
  }
}
