//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { FirstLetterPipe } from '@shared/pipes/first-letter.pipe';
import { CapitalizeFirstLetterPipe } from '@shared/pipes/capitalize-first-letter.pipe';

@Component({
    selector: 'app-activity-item',
    templateUrl: './activity-item.component.html',
    styleUrls: ['./activity-item.component.scss'],
    standalone: true,
  imports: [NgFor, NgIf, RouterLink, JsonPipe, FirstLetterPipe, CapitalizeFirstLetterPipe]
})
export class ActivityItemComponent implements OnInit {
  @Input() rows: any[];
  @Input() smallLastItem: boolean;
  @Input() link: string;
  @Input() fieldType: number;
  fieldTypes =  FieldTypes;

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
