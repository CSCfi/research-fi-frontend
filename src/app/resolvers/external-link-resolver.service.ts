//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { tap } from 'rxjs/operators';
import { ContentDataService } from '../services/content-data.service';

@Injectable({
  providedIn: 'root',
})
export class ExternalLinkResolver implements Resolve<any> {
  constructor(
    private cds: ContentDataService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Prevent API call if data exists in session storage
    if (isPlatformBrowser(this.platformId)) {
      if (!sessionStorage.getItem('externalLinkData')) {
        return this.cds
          .getExternalLinks()
          .pipe(
            tap((data) =>
              sessionStorage.setItem('externalLinkData', JSON.stringify(data))
            )
          );
      } else {
        return JSON.parse(sessionStorage.getItem('externalLinkData'));
      }
    } else {
      return this.cds.getExternalLinks();
    }
  }
}
