//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SecondaryButtonComponent } from '../../../../../shared/components/buttons/secondary-button/secondary-button.component';

@Component({
    selector: 'app-empty-card',
    templateUrl: './empty-card.component.html',
    standalone: true,
    imports: [SecondaryButtonComponent],
})
export class EmptyCardComponent implements OnInit {
  @Output() onButtonClick = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {}

  openDialog(event: MouseEvent) {
    this.onButtonClick.emit(event);
  }
}
