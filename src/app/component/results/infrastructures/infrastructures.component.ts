//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { SearchService } from 'src/app/services/search.service';
import { SortService } from 'src/app/services/sort.service';
import { Search } from 'src/app/models/search.model';

@Component({
  selector: 'app-infrastructures',
  templateUrl: './infrastructures.component.html',
  styleUrls: ['./infrastructures.component.scss']
})
export class InfrastructuresComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() resultData: Search;
  @ViewChild('main') mainContent: ElementRef;
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  faIcon = this.tabChangeService.tabData.filter(t => t.data === 'infrastructures').map(t => t.icon).pop();
  inputSub: any;
  input: string;
  focusSub: any;

  constructor(private router: Router, private route: ActivatedRoute, private tabChangeService: TabChangeService,
              private searchService: SearchService, private sortService: SortService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
    this.inputSub = this.searchService.currentInput.subscribe(input => {
      this.input = input;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    // Focus first element when clicked with skip-link
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main') {
        this.mainContent?.nativeElement.focus();
      }
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

