//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable  } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SortService {
  sortMethod: string;
  currentTab: string;
  sort: any;
  yearField = 'publicationYear';
  sortColumn: string;
  sortDirection: boolean;

  constructor() { }

  // Get sort method
  updateSort(sortBy: string) {
    this.sortMethod = sortBy;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  updateTab(tab: string) {
    this.currentTab = tab;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  updateSortAndTab(sort: string, tab: string) {
    this.sortMethod = sort;
    this.currentTab = tab;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  sortBy(sortBy: string, activeSort: string) {
    this.sortColumn = sortBy;
    this.sortDirection = sortBy === activeSort;
    return [this.sortColumn, this.sortDirection];
  }

  initSort(sort: string) {
    this.sortDirection = sort.slice(-4) === 'Desc';
    this.sortColumn = this.sortDirection ? sort.slice(0, -4) : sort;
  }

  private updateSortParam(sort: string, tab: string) {
    this.currentTab = tab;
    this.sortMethod = sort;
    switch (this.currentTab) {
      case 'publications': {
        this.yearField = 'publicationYear';

        switch (this.sortMethod) {
          case 'name': {
            this.sort = [{'publicationName.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'author': {
            this.sort = [{'authorsText.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'medium': {
            this.sort = [{'journalName.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'year': {
            this.sort = [{publicationYear: {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          default: {
            this.sort = [{publicationYear: {order: 'desc', unmapped_type : 'long'}}];
            break;
          }
        }
        break;
      }
      case 'persons': {
        this.yearField = 'publicationYear'; // Change this according to index
        break;
      }
      case 'organizations': {
        this.yearField = 'publicationYear'; // Change this according to index
        break;
      }
      case 'fundings': {
        this.yearField = 'fundingStartYear';

        switch (this.sortMethod) {
          case 'name': {
            this.sort = [{'projectNameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'funder': {
            this.sort = [{'funderNameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'funded': {
            this.sort = [{'fundedNameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'year': {
            this.sort = [{fundingStartYear: {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          default: {
            this.sort = [{fundingStartYear: {order: 'desc', unmapped_type : 'long'}}];
            break;
          }
        }
        break;
      }
    }
    return this.sort;
  }

}
