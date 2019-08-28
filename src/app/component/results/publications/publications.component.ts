//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {
  @Input() resultData: any [];
  expandStatus: Array<boolean> = [];
  sortIndicator: any;

  constructor(private router: Router, private route: ActivatedRoute, private sortService: SortService) { }

  ngOnInit() {
    this.sortService.addSortIndicator();
    this.sortIndicator = this.sortService.sortIndicator;
  }

  sortBy(sortBy) {
    const activeSort = this.route.snapshot.queryParams.sort;
    this.sortService.sortBy(sortBy, activeSort);
    const newSort = this.sortService.newSort;

    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { sort: newSort },
        queryParamsHandling: 'merge'
      }
    );
  }
}
