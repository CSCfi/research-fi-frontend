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
  tooltipUpMargin: string;
  colStyle = {
    padding: '12px 0 12px 0',
    'margin-bottom': '-12px',
    'margin-top': '-12px',
    position: 'unset'
  };
  arrowPosition: string;

  constructor( @Inject(DOCUMENT) private document: Document ) {
   }

  // Show description box
  enter(index) {
    this.hoverIndex = index;
  }

  // Get div position and place description box where cursor fires hover
  getCoords(event, index) {
    // Calculate vertical cursor position and place tooltip above or below title depending on position
    const headerHeight = this.document.getElementById('header-' + index).offsetHeight;
    if (event.clientY > 535) {
      this.tooltipUpMargin = 0 - (headerHeight + 176) + 'px';
      this.arrowPosition = 'down';
    } else {
      this.tooltipUpMargin = 0 + 'px';
      this.arrowPosition = 'up';
    }
    const divPosition = this.document.getElementById('title').getBoundingClientRect();
    // Calculate margin, prevent tooltip to get past 150px from column start
    const x = ((event.clientX - 52) - divPosition.left) < 150 ? ((event.clientX - 52) - divPosition.left) : 150;
    this.tooltipMargin = x + 'px';
  }

  // Close description
  leave(index) {
      this.hoverIndex = null;
  }

}
