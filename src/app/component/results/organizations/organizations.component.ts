//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  @Input() resultData: any [];
  expandStatus: Array<boolean> = [];
  faIcon = this.tabChangeService.tabData.filter(t => t.data === 'organizations').map(t => t.icon).pop();
  inputSub: any;
  input: string;

  constructor(private tabChangeService: TabChangeService, private searchService: SearchService) { }

  ngOnInit() {
    this.inputSub = this.searchService.currentInput.subscribe(input => {
      this.input = input;
    });

  }

  ngOnDestroy() {
    this.inputSub.unsubscribe();
  }
}
