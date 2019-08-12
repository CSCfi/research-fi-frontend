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
  input: any;
  sortMethod: string;
  requestCheck: boolean;
  sort: any;
  currentTab: any;
  sortField: string;

  constructor() { }

  // Get sort method
  getSortMethod(sortBy: string) {
    this.sortMethod = sortBy;
    this.getCurrentTab(this.currentTab);
  }

  getCurrentTab(tab: string) {
    this.currentTab = tab;
    switch (tab) {
      case 'publications': {
        this.sortField = 'publicationYear';

        switch (this.sortMethod) {
          case 'desc': {
            this.sort = [{publicationYear: {order: this.sortMethod, unmapped_type : 'long'}}];
            break;
          }
          case 'asc': {
            this.sort = [{publicationYear: {order: this.sortMethod, unmapped_type : 'long'}}];
            break;
          }
          case 'name': {
            this.sort = [{'publicationName.keyword': {order: 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'person': {
            this.sort = [{'authorsText.keyword': {order: 'asc', unmapped_type : 'long'}}];
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
      case 'fundings': {
        this.sortField = 'fundingStartYear';
        switch (this.sortMethod) {
          case 'desc': {
            this.sort = [{fundingStartYear: {order: 'desc', unmapped_type : 'long'}}];
            break;
          }
          case 'asc': {
            this.sort = [{fundingStartYear: {order: 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'name': {
            this.sort = [{'projectNameFi.keyword': {order: 'asc'}}];
            break;
          }
          case 'funder': {
            this.sort = [{'funderNameFi.keyword': {order: 'asc'}}];
            break;
          }
          default: {
            this.sort = [{fundingStartYear: {order: 'desc', unmapped_type : 'long'}}];
          }
        }
      }
    }
  }

}
