//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { faSmile } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReviewComponent implements OnInit {
  faSmile = faSmile;
  reviewTarget: string;
  targets: string[] = ['Saavutettavuudesta', 'Tietosuojasta', 'Virheellisestä tiedosta', 'Muu palaute'];

  constructor() { }

  ngOnInit(): void {
  }

}
