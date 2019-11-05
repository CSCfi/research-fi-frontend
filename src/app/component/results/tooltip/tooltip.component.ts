//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html'
})
export class TooltipComponent {
  @Input() title: string;
  @Input() description: string;
  @Input() id: string;
  @Input() index: number;
  hoverIndex: any;
  tooltipMargin: string;
  colStyle = {
    padding: '0 0 12px 0',
    'margin-bottom': '-12px',
    position: 'unset'
  };

  constructor( @Inject(DOCUMENT) private document: Document ) { }

  // Show description box
  enter(index) {
    this.hoverIndex = index;
  }

  // Get div position and place description box where cursor fires hover
  getCoords(event) {
    const divPosition = this.document.getElementById('title').getBoundingClientRect();
    const x = (event.clientX - 52) - divPosition.left;
    this.tooltipMargin = x + 'px';
  }

  // Close description
  leave(index) {
      this.hoverIndex = null;
  }

}
