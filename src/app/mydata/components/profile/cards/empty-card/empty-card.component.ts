//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-empty-card',
  templateUrl: './empty-card.component.html',
})
export class EmptyCardComponent implements OnInit {
  @Output() onButtonClick = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {}

  openDialog() {
    this.onButtonClick.emit();
  }
}
