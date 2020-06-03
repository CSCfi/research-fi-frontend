//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, ElementRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from './sort.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private modalHideSub: Subscription;
  private modalShowSub: Subscription;

  constructor(private modalService: BsModalService, private route: ActivatedRoute, private sortService: SortService,
              private router: Router) {
    // Subscribe to modal show and hide
    this.modalHideSub = this.modalService.onHide.subscribe(_ => {
      this.modalOpen = false;
    });
    this.modalShowSub = this.modalService.onShow.subscribe(_ => {
      this.modalOpen = true;
    });
  }

  modalOpen = false;
  tooltipOpen = false;

  // source: https://github.com/valor-software/ngx-bootstrap/issues/1819#issuecomment-556373372

  // prevent SHIFT+TAB so we can't go back from FIRST tab-able element outside a modal dialog
  // add this to the first tab-able element in template:  (keydown)="preventTabBack($event)"
  // condition is optional for cases where a button may not be last focusable element, for instance
  // an invalid form making submit button disabled
  static preventTabBack(event, condition?) {
    if (condition === undefined || condition) {
        if (event.shiftKey && event.keyCode === 9) {
            // shift was down when tab was pressed
            event.preventDefault();
        }
    }
  }
  // prevent TAB so we can't go beyond LAST tab-able element outside a modal dialog
  // add this to the last tab-able element in template:  (keydown)="preventTab($event)"
  // condition is optional for cases where a button may not be last focusable element, for instance
  // an invalid form making submit button disabled
  static preventTab(event, condition?) {
    if (condition === undefined || condition) {
        if (!event.shiftKey && event.keyCode === 9) {
            // shift was NOT down when tab was pressed
            event.preventDefault();
        }
    }
  }

  // A function to check if a string has valuable data to be displayed
  static stringHasContent(content: any) {
    const contentString = content?.toString();
    return contentString !== '0' &&
           contentString !== '-1' &&
           contentString !== '' &&
           contentString !== 'UNDEFINED' &&
           contentString !== 'undefined' &&
           contentString !== ' ' &&
           contentString !== '#N/A' &&
           contentString !== '[]' &&
           contentString !== null &&
           contentString !== undefined;
  }

  // A function to check if an object has any fields with valuable data
  static objectHasContent(content: object) {
    let res = false;
    Object.keys(content).forEach(key => {
      if (UtilityService.stringHasContent(content[key])) {
        res = true;
        // How to jump out of forEach after true found??
      }
    });
    return res;
  }

  // mouseenter handler for tooltipelements
  tooltipMouseenter(elem: HTMLElement) {
    elem.blur();
    elem.focus();
    this.tooltipOpen = true;
  }

  // keydown handler for tooltip elements
  tooltipKeydown(elem: HTMLElement, event: any) {
    // Timeout because event propagates here before header and thus esc would open navbar incorrecly
    if (event.keyCode === 27) {
      setTimeout(() => {
        this.tooltipOpen = false;
      }, 1);
    } else {
      this.tooltipOpen = !this.tooltipOpen;
    }
  }


  sortBy(sortBy) {
    const activeSort = this.route.snapshot.queryParams.sort || '';
    const [sortColumn, sortDirection] = this.sortService.sortBy(sortBy, activeSort);
    let newSort = sortColumn + (sortDirection ? 'Desc' : '');
    // Reset sort
    if (activeSort.slice(-4) === 'Desc' && activeSort.slice(0, -4) === sortColumn) { newSort = ''; }


    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { sort: newSort },
        queryParamsHandling: 'merge'
      }
    );
  }


}
