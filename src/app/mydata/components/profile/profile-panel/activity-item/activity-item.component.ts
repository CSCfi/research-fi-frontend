//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-activity-item',
    templateUrl: './activity-item.component.html',
    standalone: true,
    imports: [NgFor],
})
export class ActivityItemComponent implements OnInit {
  @Input() rows: any[];
  @Input() smallLastItem: boolean;

  constructor() {}

  /*
   * Component renders rows of particular item.
   */
  ngOnInit() {
    // First row should be highlighted.
    // Row value is empty string if no match in profile data
    this.rows = this.rows.filter((item) => item?.toString().trim().length > 0);
  }
}
