//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { faSmile } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-beta-review',
  templateUrl: './beta-review.component.html',
  styleUrls: ['./beta-review.component.scss']
})
export class BetaReviewComponent implements OnInit {
  faSmile = faSmile;

  constructor() { }

  ngOnInit(): void {
  }

}
