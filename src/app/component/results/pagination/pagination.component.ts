//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  page: number;
  fromPage: number; // Used for HTML rendering
  pages: number[];
  @Input() responseData: any [];
  @Input() tab: string;
  total: any;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {

    // Reset pagination
    this.page = this.searchService.pageNumber;

    this.pages = this.generatePages(this.page);

    // Initialize fromPage
    this.fromPage = (this.page - 1) * 10;

    // Get total value of results and send to search service
    this.searchService.currentTotal.subscribe(total => this.total = total);
  }

  generatePages(currentPage: number, length: number = 5) {
    // Get the highest page number for the query
    const maxPage = this.getHighestPage(this.responseData[0].hits.total);
    // Init array to correct length, make it odd and squish if not enough pages
    // tslint:disable-next-line: curly
    if (!(length % 2)) length++;
    length = Math.min(length, maxPage);
    const res = Array(length);
    // If page is at end, count from top
    // tslint:disable-next-line: no-bitwise
    if (this.page > maxPage - (length / 2 | 0)) {
      res[length - 1] = maxPage;
      for (let i = length - 2; i >= 0; i--) {
        res[i] = res[i + 1] - 1;
      }
    // Otherwise count from bottom
    } else {
      // tslint:disable-next-line: no-bitwise
      res[0] = Math.max(1, currentPage - (length / 2 | 0));
      for (let i = 1; i < length; i++) {
        res[i] = res[i - 1] + 1;
      }

    }
    return res;
  }

  getHighestPage(results: number, interval: number = 10) {
    // tslint:disable-next-line: no-bitwise
    return ((results - 1) / interval) + 1 | 0;
  }

  goToPage(n: number) {
    this.page = n;
    this.fromPage = (this.page - 1) * 10;
    this.searchService.updatePageNumber(this.page);
    this.navigate();
  }


  navigate() {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { page: this.page },
        queryParamsHandling: 'merge'
      });
  }
}
