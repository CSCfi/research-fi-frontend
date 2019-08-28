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
  sortField = 'desc';
  newSort: string;
  sortIndicator: any[];

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

  sortBy(sortBy, activeSort) {
    let newSort: any;
    switch (sortBy) {
      case 'a': {
        switch (activeSort) {
          case 'a': { this.newSort = 'aDesc'; break; }
          default: { this.newSort = 'a'; }
        }
        break;
      }
      case 'b': {
        switch (activeSort) {
          case 'b': { this.newSort = 'bDesc'; break; }
          default: { this.newSort = 'b'; }
        }
        break;
      }
      case 'c': {
        switch (activeSort) {
          case 'c': { this.newSort = 'cDesc'; break; }
          default: { this.newSort = 'c'; }
        }
        break;
      }
      case 'd': {
        switch (activeSort) {
          case 'd': { this.newSort = 'dDesc'; break; }
          default: { this.newSort = 'd'; }
        }
        break;
      }
      default: {
        newSort = 'dDesc';
      }
    }
  }

  addSortIndicator() {
    this.sortIndicator = [];
    if (!this.sortMethod) {this.sortMethod = 'dDesc'; }
    switch (this.sortMethod) {
      case 'a':
      case 'b':
      case 'c':
      case 'd': {
        this.sortIndicator.push(this.sortMethod, 'asc');
        break;
      }
      case 'aDesc':
      case 'bDesc':
      case 'cDesc':
      case 'dDesc': {
        this.sortIndicator.push(this.sortMethod, 'desc');
        break;
      }
      default: {
        this.sortIndicator.push('d', 'desc');
      }
    }
  }

  private updateSortParam(sort: string, tab: string) {
    this.currentTab = tab;
    this.sortMethod = sort;
    switch (this.currentTab) {
      case 'publications': {
        this.sortField = 'publicationYear';

        switch (this.sortMethod) {
          case 'a': {
            this.sort = [{'publicationName.keyword': {order: 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'aDesc': {
            this.sort = [{'publicationName.keyword': {order: 'desc', unmapped_type : 'long'}}];
            break;
          }
          case 'b': {
            this.sort = [{'authorsText.keyword': {order: 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'bDesc': {
            this.sort = [{'authorsText.keyword': {order: 'desc', unmapped_type : 'long'}}];
            break;
          }
          case 'c': {
            this.sort = [{'journalName.keyword': {order: 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'cDesc': {
            this.sort = [{'journalName.keyword': {order: 'desc', unmapped_type : 'long'}}];
            break;
          }
          case 'd': {
            this.sort = [{publicationYear: {order: 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'dDesc': {
            this.sort = [{publicationYear: {order: 'desc', unmapped_type : 'long'}}];
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
        this.sortField = 'publicationYear'; // Change this according to index
        break;
      }
      case 'organizations': {
        this.sortField = 'publicationYear'; // Change this according to index
        break;
      }
      case 'fundings': {
        this.sortField = 'fundingStartYear';
        switch (this.sortMethod) {
          case 'a': {
            this.sort = [{'projectNameFi.keyword': {order: 'asc'}}];
            break;
          }
          case 'aDesc': {
            this.sort = [{'projectNameFi.keyword': {order: 'desc'}}];
            break;
          }
          case 'b': {
            this.sort = [{'funderNameFi.keyword': {order: 'asc'}}];
            break;
          }
          case 'bDesc': {
            this.sort = [{'funderNameFi.keyword': {order: 'desc'}}];
            break;
          }
          case 'c': {
            this.sort = [{'fundedNameFi.keyword': {order: 'asc'}}];
            break;
          }
          case 'cDesc': {
            this.sort = [{'fundedNameFi.keyword': {order: 'desc'}}];
            break;
          }
          case 'd': {
            this.sort = [{fundingStartYear: {order: 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'dDesc': {
            this.sort = [{fundingStartYear: {order: 'desc', unmapped_type : 'long'}}];
            break;
          }
          default: {
            this.sort = [{fundingStartYear: {order: 'desc', unmapped_type : 'long'}}];
          }
        }
      }
    }
    return this.sort;
  }

}
