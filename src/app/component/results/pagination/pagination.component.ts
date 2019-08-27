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
  @Input() responseData: any [];
  @Input() tab: string;
  total: any;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    // Reset pagination
    this.page = this.searchService.pageNumber;

    // Initialize fromPage
    this.fromPage = (this.page - 1) * 10;

    // Get total value of results and send to search service
    this.searchService.currentTotal.subscribe(total => this.total = total);
    this.searchService.updateTotal(this.responseData[0].hits.total);
  }

  nextPage() {
    this.page++;
    this.fromPage = (this.page - 1) * 10;
    this.searchService.updatePageNumber(this.page);
    this.navigate();
  }

  previousPage() {
    this.page--;
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
