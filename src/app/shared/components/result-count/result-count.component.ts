//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-result-count',
  templateUrl: './result-count.component.html',
  styleUrls: ['./result-count.component.scss'],
})
export class ResultCountComponent implements OnInit, OnChanges {
  @Input() pagination: boolean;
  @Input() page: number;
  @Input() pageSize: number;
  @Input() total: any;

  fromPage: number;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.fromPage = (this.page - 1) * this.pageSize;
  }

  changePageSize(event: { target: HTMLInputElement }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1, size: event.target.value },
      queryParamsHandling: 'merge',
    });
  }
}
