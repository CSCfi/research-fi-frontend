//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, Inject } from '@angular/core';
import { SearchService } from '@portal.services/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResizeService } from 'ui-library';
import { WINDOW } from 'ui-library';
import { Search } from '@portal.models/search.model';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  page: number;
  fromPage: number; // Used for HTML rendering
  pages: number[];
  pageSize: number;
  maxPage: number;
  @Input() responseData: Search;
  @Input() tab: string;
  total: any;
  totalSub: Subscription;
  resizeSub: Subscription;
  desktop = this.window.innerWidth >= 1200;
  order = this.window.innerWidth >= 768;
  previousPage = $localize`:@@previousPage:Edellinen sivu`;
  nextPage = $localize`:@@nextPage:Seuraava sivu`;

  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  previous = $localize`:@@previous:Edellinen`;
  next = $localize`:@@next:Seuraava`;

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router,
    private resizeService: ResizeService,
    @Inject(WINDOW) private window: Window
  ) {}

  ngOnInit() {
    // Reset pagination
    this.page = this.searchService.pageNumber;

    this.pageSize = this.searchService.pageSize;

    this.pages = this.generatePages(
      this.page,
      5 + 4 * +this.desktop,
      this.pageSize
    );

    // Initialize fromPage
    this.fromPage = (this.page - 1) * this.pageSize;

    // Get total value of results and send to search service
    this.totalSub = this.searchService.currentTotal.subscribe(
      (total) => (this.total = total.value)
    );

    // Get updates for window resize
    this.resizeSub = this.resizeService.onResize$.subscribe((size) =>
      this.onResize(size)
    );
  }

  generatePages(currentPage: number, length: number, pageSize: number) {
    // Get the highest page number for the query
    this.maxPage = this.getHighestPage(this.responseData.total, pageSize);
    // Init array to correct length, make it odd and squish if not enough pages
    // Number of pages should be odd to make centering current page easy
    // tslint:disable-next-line: curly
    if (!(length % 2)) length++;
    length = Math.min(length, this.maxPage);
    const res = Array(length);
    // If page is at end, count from top
    // tslint:disable-next-line: no-bitwise
    if (this.page > this.maxPage - ((length / 2) | 0)) {
      res[length - 1] = this.maxPage;
      for (let i = length - 2; i >= 0; i--) {
        res[i] = res[i + 1] - 1;
      }
      // Otherwise count from bottom
    } else {
      // tslint:disable-next-line: no-bitwise
      res[0] = Math.max(1, currentPage - ((length / 2) | 0));
      for (let i = 1; i < length; i++) {
        res[i] = res[i - 1] + 1;
      }
    }
    return res;
  }

  getHighestPage(results: number, pageSize: number) {
    // tslint:disable-next-line: no-bitwise
    return ((results - 1) / pageSize + 1) | 0;
  }

  goToPage(n: number, pageSize: number) {
    this.page = n;
    this.fromPage = (this.page - 1) * pageSize;
    this.searchService.updatePageNumber(this.page, pageSize);
    this.navigate();
  }

  onResize(size) {
    const w = size.width;
    // Change if swap to or from desktop
    const changePages =
      (this.desktop && w < 1200) || (!this.desktop && w >= 1200);
    this.desktop = w >= 1200;
    this.order = w >= 768;
    // Generate 5 pages and 4 more if desktop (9 total for desktop so it's odd)
    if (changePages) {
      this.pages = this.generatePages(
        this.page,
        5 + 4 * +this.desktop,
        this.pageSize
      );
    }
  }

  navigate() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.page },
      queryParamsHandling: 'merge',
    });
  }
}
