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
  ViewChild,
  ElementRef,
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
  @Input() focusSelect: number; // Pass as Data.now() for new value

  fromPage: number;

  @ViewChild('selectInput') selectInput: ElementRef;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.fromPage = (this.page - 1) * this.pageSize;

    // E.g. in skip to results link in results component
    if (this.focusSelect) {
      this.selectInput.nativeElement.focus();
    }
  }

  changePageSize(event: { target: HTMLInputElement }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1, size: event.target.value },
      queryParamsHandling: 'merge',
    });
  }
}
