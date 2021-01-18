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
  RouterStateSnapshot
} from '@angular/router';
import { tap } from 'rxjs/operators';
import { ContentDataService } from '@portal.services/content-data.service';

@Injectable({
  providedIn: 'root'
})
export class ShortcutResolverService implements Resolve<any> {

  constructor( private cds: ContentDataService, @Inject(PLATFORM_ID) private platformId: object) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Prevent API call if data exists in session storage
    if (isPlatformBrowser(this.platformId)) {
      if (!sessionStorage.getItem('shortcutData')) {
        return this.cds.getShortcuts().pipe(tap(data => sessionStorage.setItem('shortcutData', JSON.stringify(data))));
      } else {
        return JSON.parse(sessionStorage.getItem('shortcutData'));
      }
    } else {
      return this.cds.getShortcuts();
    }
  }
}
