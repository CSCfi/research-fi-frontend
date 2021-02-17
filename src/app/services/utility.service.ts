//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, ElementRef, Inject, LOCALE_ID } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from './sort.service';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  private modalHideSub: Subscription;
  private modalShowSub: Subscription;

  constructor(
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private sortService: SortService,
    private router: Router,
    private meta: Meta
  ) {
    // Subscribe to modal show and hide
    this.modalHideSub = this.modalService.onHide.subscribe((_) => {
      this.modalOpen = false;
    });
    this.modalShowSub = this.modalService.onShow.subscribe((_) => {
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
    return (
      contentString !== '0' &&
      contentString !== '-1' &&
      contentString !== '' &&
      contentString !== 'UNDEFINED' &&
      contentString !== 'undefined' &&
      contentString !== ' ' &&
      contentString !== '#N/A' &&
      contentString !== '[]' &&
      contentString !== null &&
      contentString !== undefined
    );
  }

  // A function to check if an object has any fields with valuable data
  static objectHasContent(content: object) {
    let res = false;
    Object.keys(content).forEach((key) => {
      if (UtilityService.stringHasContent(content[key])) {
        res = true;
        // How to jump out of forEach after true found??
      }
    });
    return res;
  }

  static replaceSpecialChars(s: string) {
    return s.toString().replace(/ |,|\.|\(|\)|\&/g, '-');
  }

  static thousandSeparator(s: string) {
    return s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  // Fisher–Yates Shuffle
  // https://bost.ocks.org/mike/shuffle/
  static shuffle(arr: any[], start = 0): any[] {
    const prefix = arr.slice(0, start);
    const array = arr.slice(start);

    let m = array.length;
    let t;
    let i;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return prefix.concat(array);
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

  // Sort component logic
  sortBy(sortBy) {
    const activeSort = this.route.snapshot.queryParams.sort || '';
    const [sortColumn, sortDirection] = this.sortService.sortBy(
      sortBy,
      activeSort
    );
    let newSort = sortColumn + (sortDirection ? 'Desc' : '');
    // Reset sort
    if (
      activeSort.slice(-4) === 'Desc' &&
      activeSort.slice(0, -4) === sortColumn
    ) {
      newSort = '';
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1, sort: newSort },
      queryParamsHandling: 'merge',
    });
  }

  addMeta(title: string, description: string, imageAlt: string) {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({
      property: 'og:image',
      content: 'https://tiedejatutkimus.fi/fi/assets/img/logo.jpg',
    });
    this.meta.updateTag({ property: 'og:image:alt', content: imageAlt });
    this.meta.updateTag({ property: 'og:image:height', content: '100' });
    this.meta.updateTag({ property: 'og:image:width', content: '100' });
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({
      name: 'twitter:image',
      content: 'https://tiedejatutkimus.fi/fi/assets/img/logo.jpg',
    });
  }
}
