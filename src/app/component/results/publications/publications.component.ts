//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { SearchService } from 'src/app/services/search.service';
import { Search } from 'src/app/models/search.model';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit, OnDestroy {
  @Input() resultData: Search;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;

  faIcon = this.tabChangeService.tabData.filter(t => t.data === 'publications').map(t => t.icon).pop();
  documentLang: any;
  input: string;
  inputSub: any;

  constructor(private router: Router, private route: ActivatedRoute, private sortService: SortService,
              @Inject(DOCUMENT) private document: any, private tabChangeService: TabChangeService,
              private searchService: SearchService, private cdr: ChangeDetectorRef) {
                this.documentLang = this.document.documentElement.lang;
               }

  ngOnInit() {
    // Check url for sorting, default to empty
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
    this.inputSub = this.searchService.currentInput.subscribe(input => {
      this.input = input;
    });
  }

  isReviewed(type: string) {
    if (!type) {return false; }
    return type[0] === 'A' || type[0] === 'C';
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
