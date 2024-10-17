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
import { SecondaryButtonComponent } from '../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NewsCardComponent } from '../news-card/news-card.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-latest-news',
    templateUrl: './latest-news.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NewsCardComponent,
        MatProgressSpinner,
        SecondaryButtonComponent,
    ],
})
export class LatestNewsComponent implements OnInit, OnDestroy {
  data: any = [];
  errorMessage: any;
  currentPageSize: number = 20;
  @Input() mobile: any;
  @Input() visible: boolean;
  loading: boolean = false;
  latestNewsSub: Subscription;
  startIndex = 0;

  constructor(public searchService: SearchService) {}

  ngOnInit(): void {
    this.getLatestNews(this.currentPageSize, this.startIndex, false);
  }

  getLatestNews(size: number, from: number, loadMore = false) {
    this.loading = true;
    this.latestNewsSub = this.searchService
      .getNews(size, from)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          if (loadMore) {
            this.data = this.data.concat(data);
          } else {
            this.data = data;
          }
          this.loading = false;
        },
        error: (error) => (this.errorMessage = error as any),
      });
  }

  loadMoreNews() {
    this.startIndex += this.currentPageSize;
    this.getLatestNews(this.currentPageSize, this.startIndex, true);
  }

  ngOnDestroy() {
    this.latestNewsSub?.unsubscribe();
  }
}
