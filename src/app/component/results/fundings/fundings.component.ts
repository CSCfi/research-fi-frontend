//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { faEuroSign } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss']
})
export class FundingsComponent implements OnInit {
  @Input() resultData: any [];
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;
  faEuroSign = faEuroSign;

  constructor(private router: Router, private route: ActivatedRoute, private sortService: SortService) { }

  ngOnInit() {
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
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
}
