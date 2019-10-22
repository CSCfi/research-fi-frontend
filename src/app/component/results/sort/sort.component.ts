//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { TabChangeService } from '../../../services/tab-change.service';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss']
})
export class SortComponent implements OnInit, OnDestroy {
  tabLink: string;
  tabFields: any;
  sortBy: string;
  tabSub: any;

  // Assign values to dropdown list by current tab
  publicationFields = [
    {label: 'Uusin ensin', value: 'yearDesc'},
    {label: 'Vanhin ensin', value: 'year'},
    {label: 'Julkaisun nimen mukaan (A-Ö)', value: 'name'},
    {label: 'Ensimmäisen tekijän mukaan (A-Ö)', value: 'author'}
  ];
  fundingFields = [
    {label: 'Uusin ensin', value: 'yearDesc'},
    {label: 'Vanhin ensin', value: 'year'},
    {label: 'Hankkeen nimen mukaan (A-Ö)', value: 'name'},
    {label: 'Rahoittajan mukaan (A-Ö)', value: 'funder'}
  ];

  constructor( private route: ActivatedRoute, private router: Router, private sortService: SortService,
               private tabChangeService: TabChangeService ) {
   }

  ngOnInit() {
    // Subscribe to current tab parameter
    this.tabSub = this.tabChangeService.currentTab.subscribe(tab => {
      switch (tab.link) {
        case 'publications': {
          this.tabFields = this.publicationFields;
          break;
        }
        case 'fundings': {
          this.tabFields = this.fundingFields;
          break;
        }
      }
      // Get sort from url and reset sort on tab change
      if (!this.sortBy ? this.sortBy : 'reset') {}
      this.sortBy = this.route.snapshot.queryParams.sort || 'reset';
  });
  }

  // Send value to service and rewrite url
  orderBy(): void {
    this.sortService.updateSort(this.sortBy);
    this.navigate();
  }

  navigate() {
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { sort: this.sortBy },
        queryParamsHandling: 'merge'
      }
    );
  }

  ngOnDestroy() {
    this.tabSub.unsubscribe();
  }

}
