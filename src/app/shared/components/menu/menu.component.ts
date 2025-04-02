// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    standalone: true,
  imports: [
    MatMenuTrigger,
    MatMenu,
    NgFor,
    MatMenuItem,
    SvgSpritesComponent
  ]
})
export class MenuComponent {
  @Input() label: string;
  @Input() options: any[];

  @Output() onSelectionChange = new EventEmitter<any>();

  constructor() {}

  selectOption(option) {
    this.onSelectionChange.emit(option);
  }
}
