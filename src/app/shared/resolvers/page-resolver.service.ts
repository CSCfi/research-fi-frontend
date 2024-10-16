//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { CMSContentService } from '../services/cms-content.service';

@Injectable({
  providedIn: 'root',
})
export class PageResolverService  {
  constructor(
    private cmsContentService: CMSContentService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Prevent API call if data exists in session storage
    if (isPlatformBrowser(this.platformId)) {
      if (!sessionStorage.getItem('pageData')) {
        return this.cmsContentService
          .getPages()
          .pipe(
            tap((data) =>
              sessionStorage.setItem('pageData', JSON.stringify(data))
            )
          );
      } else {
        return JSON.parse(sessionStorage.getItem('pageData'));
      }
    } else {
      return this.cmsContentService.getPages();
    }
  }
}
