//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { SearchService } from 'src/app/services/search.service';
import { SortService } from 'src/app/services/sort.service';

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

  constructor(private router: Router, private route: ActivatedRoute, private tabChangeService: TabChangeService, 
              private searchService: SearchService, private sortService: SortService) { }

  ngOnInit() {
    this.inputSub = this.searchService.currentInput.subscribe(input => {
      this.input = input;
    });
  }

  sortBy(sortBy) {
    const activeSort = this.route.snapshot.queryParams.sort || '';
    const [sortColumn, sortDirection] = this.sortService.sortBy(sortBy, activeSort);
    let newSort = sortColumn + (sortDirection ? 'Desc' : '');
    // Reset sort
    if (activeSort.slice(-4) === 'Desc') { newSort = ''; }


    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { sort: newSort },
        queryParamsHandling: 'merge'
      }
    );
  }

  ngOnDestroy() {
    this.inputSub.unsubscribe();
  }
}
