//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { SortByOption } from 'src/types';
import { NgFor } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { SecondaryButtonComponent } from '../secondary-button/secondary-button.component';

@Component({
    selector: 'app-sort-by-button',
    templateUrl: './sort-by-button.component.html',
    standalone: true,
    imports: [
        SecondaryButtonComponent,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        NgFor,
    ],
})

/*
 * This component is used to render sort options in mobile resolutions.
 */
export class SortByButtonComponent implements OnInit {
  @Input() options: SortByOption[];
  @Input() activeSort: string;
  @Input() customSortByRelevanceLabel: string;

  @Output() onOptionClick = new EventEmitter<{
    key: string;
    direction: string;
  }>();

  sortByRelevance = {
    label: $localize`:@@sortByRelevance:Osuvin tulos ensin`,
    key: 'reset',
  };

  faChevronDown = faChevronDown;
  activeSortLabel: string;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.setActiveSortLabel(this.activeSort);
  }

  sortBy(option: SortByOption) {
    this.setActiveSortLabel(option.key);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams:
        option.key === 'reset'
          ? { sort: null, sortDirection: null }
          : { sort: option.key, sortDirection: option.direction || 'asc' }, // Default direction to asc in mobile view
      queryParamsHandling: 'merge',
    });
  }

  setActiveSortLabel(active) {
    this.activeSortLabel = this.customSortByRelevanceLabel
      ? this.customSortByRelevanceLabel
      : this.options.find((options) => options.key === active)?.label ||
        this.sortByRelevance.label;
  }
}
