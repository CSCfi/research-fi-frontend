//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from '@angular/core';
import { TabChangeService } from 'src/app/services/tab-change.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent {
  @Input() resultData: any [];
  expandStatus: Array<boolean> = [];
  faIcon = this.tabChangeService.tabData.filter(t => t.data === 'organizations').map(t => t.icon).pop();

  constructor(private tabChangeService: TabChangeService) { }
}
