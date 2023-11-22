//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  @Input() page: number = 1;
  @Input() pageSize: number = 10;
  @Input() total: number = 0;

  fromPage: number; // Used for HTML rendering

  ngOnInit(): void {
    this.fromPage = (this.page - 1) * this.pageSize;
  }

  pages$: Observable<number[]> = this.breakpointObserver.observe('(min-width: 1200px)').pipe(
    map(result => generatePages(this.page, result.matches ? 9 : 5, this.total, this.pageSize))
  );

  order$ = this.breakpointObserver.observe('(min-width: 768px)').pipe(
    map(result => result.matches)
  );

  previous = $localize`:@@previous:Edellinen`;
  next = $localize`:@@next:Seuraava`;
  previousPage = $localize`:@@previousPage:Edellinen sivu`;
  nextPage = $localize`:@@nextPage:Seuraava sivu`;
  tooManyResultstext = $localize`:@@tooManyResultsNavigationDisabled:Liikaa tuloksia. Haun loppuun navigoiminen estetty.`;


  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;
  faInfoCircle = faInfoCircle;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  goToPage(n: number) {
    this.navigate(n);
  }

  goToFirstPage() {
    this.navigate(1);
  }

  goToLastPage() {
    const lastPage = countTotalPages(this.total, this.pageSize);
    this.navigate(lastPage);
  }

  navigate(page: number = this.page) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge',
    });
  }
}

function countTotalPages(totalDocuments, pageSize): number {
  return Math.ceil(totalDocuments / pageSize);
}

function generatePages(currentPage: number, range: 5 | 9, results: number, pageSize: number): number[] {
  let output: number[] = [];
  const maxPage = countTotalPages(results, pageSize);
  const i = currentPage;

  if (range === 5) {
    output = [i-2, i-1, i, i+1, i+2];
  }

  if (range === 9) {
    output = [i-4, i-3, i-2, i-1, i, i+1, i+2, i+3, i+4];
  }

  const min = Math.min(...output);
  const max = Math.max(...output);

  if (min < 1) {
    const increment = 1 - output[0];
    output = output.map(i => i + increment);

    return output.filter(i => i <= maxPage);
  }

  if (max > maxPage) {
    const offset = max - maxPage;
    output = output.map(i => i - offset);

    return output.filter(i => i >= 1);
  }

  return output;
}
