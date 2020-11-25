//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { ContentDataService } from '../services/content-data.service';

@Injectable({
  providedIn: 'root'
})
export class ResearchInnovationSystemSectorResolver implements Resolve<any> {

  constructor( private cds: ContentDataService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.cds.getSectors();
  }
}
