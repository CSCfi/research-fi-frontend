//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {
  @Input() resultData: any [];
  expandStatus: Array<boolean> = [];
  sortIndicator: any;

  constructor(private router: Router, private route: ActivatedRoute, private sortService: SortService) { }

  ngOnInit() {
    this.addSortIndicator();
  }

  addSortIndicator() {
    this.sortIndicator = [];
    let sortMethod = this.sortService.sortMethod;
    if (!sortMethod) {sortMethod = 'yearDesc'; }
    switch (sortMethod) {
      case 'name':
      case 'author':
      case 'journal':
      case 'year': {
        this.sortIndicator.push(sortMethod, 'asc');
        break;
      }
      case 'nameDesc':
      case 'authorDesc':
      case 'journalDesc':
      case 'yearDesc': {
        this.sortIndicator.push(sortMethod, 'desc');
        break;
      }
      default: {
        this.sortIndicator.push('year', 'desc');
      }
    }
    console.log(this.sortIndicator);
  }

  sortBy(sortBy) {
    const activeSort = this.route.snapshot.queryParams.sort;
    let newSort: any;
    switch (sortBy) {
      case 'name': {
        switch (activeSort) {
          case 'name': {
            newSort = 'nameDesc';
            break;
          }
          case 'nameDesc': {
            newSort = [];
            break;
          }
          default: {newSort = 'name'; }
        }
        break;
      }
      case 'author': {
        switch (activeSort) {
          case 'author': {
            newSort = 'authorDesc';
            break;
          }
          case 'authorDesc': {
            newSort = [];
            break;
          }
          default: {newSort = 'author'; }
        }
        break;
      }
      case 'journal': {
        switch (activeSort) {
          case 'journal': {
            newSort = 'journalDesc';
            break;
          }
          case 'journalDesc': {
            newSort = [];
            break;
          }
          default: {newSort = 'journal'; }
        }
        break;
      }
      case 'year': {
        switch (activeSort) {
          case 'year': {
            newSort = 'yearDesc';
            break;
          }
          case 'yearDesc': {
            newSort = [];
            break;
          }
          default: {newSort = 'year'; }
        }
        break;
      }
      default: {
        newSort = 'yearDesc';
      }
    }
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { sort: newSort },
        queryParamsHandling: 'merge'
      }
    );
  }
}
