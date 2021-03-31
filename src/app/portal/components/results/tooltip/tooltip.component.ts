//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, Inject, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SearchService } from 'src/app/portal/services/search.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
})
export class TooltipComponent implements OnInit, OnDestroy {
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
    position: 'unset',
  };
  arrowPosition: string;
  hasDescription: boolean;
  inputSub: any;
  input: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private searchService: SearchService
  ) {}

  // Show description box
  enter(index) {
    this.hoverIndex = index;
  }

  // Get div position and place description box where cursor fires hover
  getCoords(event, index, description) {
    description = description ? description : ' ';
    this.hasDescription = description.length > 10 ? true : false;
    // Calculate vertical cursor position and place tooltip above or below title depending on position
    const headerHeight = this.document.getElementById('header-' + index)
      .offsetHeight;
    if (event.clientY > 535) {
      // Calculate tooltip height, 41 is character count that goes to one row
      const toolTipHeight = description.length > 41 ? 176 : 78;
      this.tooltipUpMargin = 0 - (headerHeight + toolTipHeight) + 'px';
      this.arrowPosition = 'down';
    } else {
      this.tooltipUpMargin = 0 + 'px';
      this.arrowPosition = 'up';
    }
    const divPosition = this.document
      .getElementById('title')
      .getBoundingClientRect();
    // Calculate margin, prevent tooltip to get past 150px from column start
    const x =
      event.clientX - 52 - divPosition.left < 150
        ? event.clientX - 52 - divPosition.left
        : 150;
    this.tooltipMargin = x + 'px';
  }

  // Close description
  leave(index) {
    this.hoverIndex = null;
  }

  ngOnInit() {
    this.inputSub = this.searchService.currentInput.subscribe((input) => {
      this.input = input;
    });
  }

  ngOnDestroy() {
    this.inputSub?.unsubscribe();
  }
}
