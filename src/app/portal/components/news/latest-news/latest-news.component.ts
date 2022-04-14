//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SearchService } from '@portal/services/search.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-latest-news',
  templateUrl: './latest-news.component.html',
})
export class LatestNewsComponent implements OnInit, OnDestroy {
  data: any = [];
  errorMessage: any;
  currentPageSize: number = 20;
  @Input() mobile: any;
  @Input() visible: boolean;
  loading: boolean = false;
  latestNewsSub: Subscription;

  constructor(public searchService: SearchService) {}

  ngOnInit(): void {
    this.getLatestNews(this.currentPageSize);
  }

  getLatestNews(size: number, from: number = 0) {
    this.loading = true;
    this.latestNewsSub = this.searchService
      .getNews(size, from)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.data = this.data.concat(data);
          this.loading = false;
        },
        error: (error) => (this.errorMessage = error as any),
      });
  }

  loadMoreNews() {
    this.getLatestNews(20, this.currentPageSize);
  }

  ngOnDestroy() {
    this.latestNewsSub?.unsubscribe();
  }
}
