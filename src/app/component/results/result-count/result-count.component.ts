//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Search } from 'src/app/models/search.model';
import { DataService } from 'src/app/services/data.service';
import { SearchService } from 'src/app/services/search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-result-count',
  templateUrl: './result-count.component.html',
  styleUrls: ['./result-count.component.scss']
})
export class ResultCountComponent implements OnInit, OnDestroy {
  @Input() responseData: any;
  @Input() pagination: boolean;
  total: string | number;
  routeSub: Subscription;
  totalSub: any;
  page: number;
  fromPage: number;
  currentSize: any;
  constructor(private searchService: SearchService, private dataService: DataService, private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.searchService.pageSize = params.size;
      this.currentSize = parseInt(params.size, 10) || 10;
    });

    this.totalSub = this.dataService.currentTotal.subscribe(total => {
      this.total = total;
      // Get current page
      this.page = this.searchService.pageNumber;
      // Initialize fromPage
      this.fromPage = (this.page - 1) * this.currentSize;
    });
  }

  change(event) {
    this.searchService.pageSize = event.target.value;
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { page: 1, size: event.target.value },
        queryParamsHandling: 'merge'
      });
  }

  ngOnDestroy() {
    this.totalSub?.unsubscribe();
  }

}
